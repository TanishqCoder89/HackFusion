// Connects the embedded AI interview room to the host platform (same origin):
//  - attaches the signed-in user's token to API calls
//  - pre-fills / locks the lobby from the platform's interview + candidate profile
//  - reports the final result back to the parent page
(function () {
  var params = new URLSearchParams(location.search);
  var interviewId = params.get('interviewId');
  var token = null;
  try { token = localStorage.getItem('ai_interviewer_token'); } catch (e) { /* storage blocked */ }
  window.__platformToken = token || '';

  var nativeFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (token && url.indexOf('/api/') === 0 && url.indexOf('/api/webrtc/') !== 0) {
      init = init || {};
      init.headers = Object.assign({}, init.headers || {}, { Authorization: 'Bearer ' + token });
    }
    return nativeFetch(input, init);
  };

  function api(path) {
    return nativeFetch('/api' + path, { headers: { Authorization: 'Bearer ' + token } }).then(function (r) {
      if (!r.ok) throw new Error('Request failed: ' + path);
      return r.json();
    });
  }

  function hide(el) {
    if (!el) return;
    var group = el.closest('.form-group') || el;
    group.style.display = 'none';
  }

  function fill() {
    if (!interviewId || !token) return;
    Promise.all([api('/interviews/' + interviewId), api('/auth/me'), api('/jobs').catch(function () { return { jobs: [] }; })])
      .then(function (res) {
        var interview = res[0].interview;
        var user = res[1].user;
        var job = (res[2].jobs || []).filter(function (j) { return j.id === interview.jobId; })[0];

        var skills = (interview.requiredSkills || []).slice(0, 6).join(', ');
        var topic = (interview.jobTitle || interview.title) + (skills ? ' (' + skills + ')' : '');
        var focus = (interview.questions || []).map(function (q) { return q.question; }).filter(Boolean).slice(0, 3);
        if (focus.length) topic += '. Focus areas: ' + focus.join(' | ');

        var name = document.getElementById('candidate-name');
        name.value = user.name || 'Candidate';
        name.readOnly = true;

        var topicInput = document.getElementById('interview-topic');
        topicInput.value = topic.slice(0, 400);
        topicInput.readOnly = true;

        var mode = document.getElementById('interview-mode');
        if (mode) { mode.value = 'topic'; mode.dispatchEvent(new Event('change')); hide(mode); }

        var exp = (job && job.experience) || '';
        var years = parseInt((exp.match(/\d+/) || [2])[0], 10);
        var diff = document.getElementById('interview-difficulty');
        if (diff) { diff.value = years >= 5 ? 'Senior' : years >= 2 ? 'Mid-Level' : 'Junior'; hide(diff); }

        var count = document.getElementById('question-count');
        var minutes = interview.durationMinutes || 45;
        if (count) { count.value = minutes <= 15 ? '3' : minutes <= 30 ? '5' : '8'; hide(count); }

        // The platform runs its own graded coding round, so the room's built-in coding phase is off.
        var coding = document.getElementById('include-coding');
        if (coding) { coding.value = 'no'; hide(coding); }

        var key = document.getElementById('groq-key');
        if (key) { key.value = ''; hide(key); }

        document.body.classList.add('platform-embedded');
        window.parent.postMessage({ type: 'avatar-ready' }, location.origin);
      })
      .catch(function (err) {
        console.error('[Platform bridge] could not load interview:', err);
        window.parent.postMessage({ type: 'avatar-error', message: String(err.message || err) }, location.origin);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
  else fill();

  window.addEventListener('avatar:report', function (e) {
    window.parent.postMessage({ type: 'avatar-complete', payload: e.detail }, location.origin);
  });
})();
