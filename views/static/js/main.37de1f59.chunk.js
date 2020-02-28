(this.webpackJsonpclient = this.webpackJsonpclient || []).push([
  [0],
  {
    49: function(e, t, n) {
      e.exports = n(79);
    },
    54: function(e, t, n) {},
    55: function(e, t, n) {},
    79: function(e, t, n) {
      'use strict';
      n.r(t);
      var a = n(0),
        r = n.n(a),
        c = n(18),
        o = n.n(c),
        l = (n(54), n(17)),
        i = n(27),
        s = n(16),
        u = (n(55), n(93)),
        d = function(e) {
          var t = e.handleClick,
            n = e.title;
          return r.a.createElement(
            u.a,
            { variant: 'contained', color: 'primary', onClick: t },
            n,
          );
        },
        p = 'http://localhost:8333',
        f = ''.concat(p, '/auth'),
        h = n(44),
        m = n.n(h),
        b = function(e) {
          var t = e.title,
            n = Object(s.f)(),
            a = window;
          if (!a.callback) {
            a.callback = function(e) {
              if (e)
                try {
                  var t = m.a.post(''.concat(p, '/callback'), { t: e });
                  console.log('token', t), n.push('/content');
                } catch (a) {
                  console.error('error', a);
                }
              else console.error('ERROR: param is invalid!');
            };
          }
          return r.a.createElement(d, {
            handleClick: function() {
              window.open(f);
            },
            title: t,
          });
        },
        E = n(20),
        v = n.n(E),
        k = n(23),
        O = n(12),
        w = n(21),
        g = n(95),
        y = n(96),
        j = n(98),
        x = n(97),
        C = function(e) {
          var t = e.board,
            n = e.selected,
            a = e.handleSelect,
            c = t.id,
            o = t.name,
            l = t.desc,
            i = Object(w.indexOf)(n, c) >= 0;
          return r.a.createElement(
            r.a.Fragment,
            null,
            r.a.createElement(x.a, {
              onChange: function() {
                a(c);
              },
              checked: i,
            }),
            r.a.createElement('span', null, ''.concat(o, ' ## ').concat(l)),
          );
        };
      function R() {
        return (R = Object(k.a)(
          v.a.mark(function e(t) {
            var n;
            return v.a.wrap(
              function(e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (
                        console.log('Subscribed events', t),
                        console.log('Trello ins', Trello),
                        (e.prev = 2),
                        (e.next = 5),
                        Trello.put('webhooks', {
                          idModel: t[0],
                          description: '',
                          callbackURL:
                            'https://j-int.herokuapp.com/trello/hook',
                        })
                      );
                    case 5:
                      (n = e.sent), console.log('==>RET', n), (e.next = 12);
                      break;
                    case 9:
                      (e.prev = 9),
                        (e.t0 = e.catch(2)),
                        console.error('ERROR: ', e.t0);
                    case 12:
                    case 'end':
                      return e.stop();
                  }
              },
              e,
              null,
              [[2, 9]],
            );
          }),
        )).apply(this, arguments);
      }
      var T = Object(g.a)(function(e) {
          return {
            root: {
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              overflow: 'hidden',
              width: '80%',
              height: '90%',
              backgroundColor: e.palette.background.default,
            },
            gridList: { width: '95%', height: '100%' },
            gridChild: {
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              color: 'black',
              fontSize: 14,
            },
          };
        }),
        S = function(e, t) {
          switch (t.type) {
            case 'FETCH_DONE':
              var n = t.boards || [];
              return Object(O.a)(n);
            case 'RESET':
              return [];
            default:
              return e;
          }
        },
        N = function(e, t) {
          switch (t.type) {
            case 'TOGGLE':
              var n = e;
              return (
                Object(w.indexOf)(e, t.board) >= 0
                  ? (n = Object(w.filter)(n, function(e) {
                      return t.board !== e;
                    }))
                  : n.push(t.board),
                Object(O.a)(n)
              );
            case 'RESET':
              return [];
            default:
              return e;
          }
        },
        L = function() {
          var e = T(),
            t = Object(a.useReducer)(S, []),
            n = Object(l.a)(t, 2),
            c = n[0],
            o = n[1],
            i = Object(a.useReducer)(N, []),
            s = Object(l.a)(i, 2),
            d = s[0],
            p = s[1];
          Object(a.useEffect)(function() {
            (function() {
              var e = Object(k.a)(
                v.a.mark(function e() {
                  var t, n, a;
                  return v.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (e.prev = 0),
                              (e.next = 3),
                              Trello.members.get('me')
                            );
                          case 3:
                            return (
                              (t = e.sent),
                              (n = t.username),
                              (e.next = 7),
                              Trello.members.get(''.concat(n, '/boards'), {
                                filter: 'open',
                                fields: 'id,name,desc',
                              })
                            );
                          case 7:
                            (a = e.sent),
                              o({ type: 'FETCH_DONE', boards: a }),
                              (e.next = 15);
                            break;
                          case 11:
                            (e.prev = 11),
                              (e.t0 = e.catch(0)),
                              console.error(e.t0),
                              o({ type: 'RESET', boards: [] });
                          case 15:
                          case 'end':
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[0, 11]],
                  );
                }),
              );
              return function() {
                return e.apply(this, arguments);
              };
            })()();
          }, []);
          var f = function(e) {
            p({ type: 'TOGGLE', board: e });
          };
          return r.a.createElement(
            'div',
            { className: e.root },
            r.a.createElement(
              y.a,
              { cellHeight: 60, className: e.gridList, cols: 2 },
              c.map(function(t) {
                return r.a.createElement(
                  j.a,
                  { className: e.gridChild, key: t.id, cols: 1 },
                  r.a.createElement(C, {
                    board: t,
                    selected: d,
                    handleSelect: f,
                  }),
                );
              }),
            ),
            r.a.createElement(
              u.a,
              {
                variant: 'outlined',
                color: 'primary',
                onClick: function() {
                  !(function(e) {
                    R.apply(this, arguments);
                  })(d);
                },
              },
              'Save',
            ),
          );
        },
        G = function() {
          var e = Object(a.useState)('closed'),
            t = Object(l.a)(e, 2);
          t[0], t[1];
          return r.a.createElement(
            i.a,
            null,
            r.a.createElement(
              'div',
              { className: 'App' },
              r.a.createElement(
                'header',
                { className: 'App-header' },
                r.a.createElement(
                  'div',
                  {
                    style: { display: 'flex', justifyContent: 'space-around' },
                  },
                  r.a.createElement(
                    s.c,
                    null,
                    r.a.createElement(
                      s.a,
                      { exact: !0, path: '/' },
                      r.a.createElement(b, { title: 'Auth' }),
                    ),
                    r.a.createElement(
                      s.a,
                      { path: '/content' },
                      r.a.createElement(L, null),
                    ),
                  ),
                ),
              ),
            ),
          );
        };
      Boolean(
        'localhost' === window.location.hostname ||
          '[::1]' === window.location.hostname ||
          window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
          ),
      );
      o.a.render(r.a.createElement(G, null), document.getElementById('root')),
        'serviceWorker' in navigator &&
          navigator.serviceWorker.ready.then(function(e) {
            e.unregister();
          });
    },
  },
  [[49, 1, 2]],
]);
//# sourceMappingURL=main.37de1f59.chunk.js.map
