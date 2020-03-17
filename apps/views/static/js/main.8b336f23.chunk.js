(this.webpackJsonpclient = this.webpackJsonpclient || []).push([
  [0],
  {
    54: function(e, t, r) {
      e.exports = r(86);
    },
    59: function(e, t, r) {},
    61: function(e, t, r) {},
    86: function(e, t, r) {
      'use strict';
      r.r(t);
      var n = r(0),
        a = r.n(n),
        c = r(23),
        o = r.n(c),
        s = (r(59), r(4)),
        u = r.n(s),
        l = r(11),
        i = r(19),
        p = r(20),
        d = (r(61), r(48)),
        f = r(100),
        b = function(e) {
          var t = e.handleClick,
            r = e.title;
          return a.a.createElement(
            f.a,
            { variant: 'contained', color: 'primary', onClick: t },
            r,
          );
        },
        h = 'https://j-int.herokuapp.com',
        v = ''.concat(h, '/auth'),
        m = r(18),
        E = r.n(m),
        k = r(31),
        O = r.n(k),
        g = function(e) {
          var t = e.title,
            r = e.status,
            n = e.handleStatus,
            c = Object(p.g)(),
            o = window;
          if (!o.callback) {
            var s = (function() {
              var e = Object(l.a)(
                u.a.mark(function e(t) {
                  var r, a, o, s, l, i;
                  return u.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (t) {
                              e.next = 3;
                              break;
                            }
                            return (
                              console.error('ERROR: param is invalid!'),
                              e.abrupt('return')
                            );
                          case 3:
                            if (
                              ((e.prev = 3),
                              !((r = window.location.href).indexOf('?') <= 0))
                            ) {
                              e.next = 8;
                              break;
                            }
                            return (
                              console.error('===>Can not get webhook'),
                              e.abrupt('return')
                            );
                          case 8:
                            return (
                              (a = r.split('?')[1].replace(/#\/\w*/g, '')),
                              (o = O.a.parse(a)),
                              (s = ''),
                              0 === t.indexOf('#') && (s = t.substring(1)),
                              (l = O.a.parse(s)),
                              (e.next = 15),
                              E.a.post(
                                ''.concat(h, '/auth/token'),
                                Object(d.a)({}, o, {}, l),
                              )
                            );
                          case 15:
                            if (
                              ((i = e.sent),
                              console.log('token', i),
                              i && 200 === i.status)
                            ) {
                              e.next = 20;
                              break;
                            }
                            return (
                              console.error('no token returned'),
                              e.abrupt('return')
                            );
                          case 20:
                            localStorage.setItem('__rid', i.data.rtk),
                              n('AUTHED'),
                              c.replace('/'),
                              (e.next = 28);
                            break;
                          case 25:
                            (e.prev = 25),
                              (e.t0 = e.catch(3)),
                              console.error('error', e.t0);
                          case 28:
                          case 'end':
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[3, 25]],
                  );
                }),
              );
              return function(t) {
                return e.apply(this, arguments);
              };
            })();
            o.callback = s;
          }
          var i = function() {
            window.open(v);
          };
          return a.a.createElement(p.b, {
            render: function(e) {
              var n = e.location;
              return 'AUTHED' !== r
                ? a.a.createElement(b, { handleClick: i, title: t })
                : a.a.createElement(p.a, {
                    to: { pathname: '/', state: { from: n } },
                  });
            },
          });
        };
      function x(e) {
        return w.apply(this, arguments);
      }
      function w() {
        return (w = Object(l.a)(
          u.a.mark(function e(t) {
            var r, n, a;
            return u.a.wrap(function(e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    if (t) {
                      e.next = 2;
                      break;
                    }
                    return e.abrupt('return', null);
                  case 2:
                    return (
                      (e.next = 4), E.a.post(''.concat(h, '/auth'), { rtk: t })
                    );
                  case 4:
                    if (
                      ((r = e.sent), (n = r.status), (a = r.data), 200 === n)
                    ) {
                      e.next = 10;
                      break;
                    }
                    return (
                      console.error('===>Error to get events', a),
                      e.abrupt('return', null)
                    );
                  case 10:
                    return (
                      console.log('===>status ret', a), e.abrupt('return', a)
                    );
                  case 12:
                  case 'end':
                    return e.stop();
                }
            }, e);
          }),
        )).apply(this, arguments);
      }
      var j = r(13),
        y = r(102),
        T = r(103),
        S = r(105),
        C = r(25),
        R = r(104),
        I = function(e) {
          var t = e.board,
            r = e.selected,
            n = e.handleSelect,
            c = t.id,
            o = t.name,
            s = t.desc,
            u = Object(C.indexOf)(r, c) >= 0;
          return a.a.createElement(
            a.a.Fragment,
            null,
            a.a.createElement(R.a, {
              onChange: function() {
                n(c);
              },
              checked: u,
            }),
            a.a.createElement('span', null, ''.concat(o, ' ## ').concat(s)),
          );
        };
      function N(e) {
        return _.apply(this, arguments);
      }
      function _() {
        return (_ = Object(l.a)(
          u.a.mark(function e(t) {
            var r, n, a;
            return u.a.wrap(function(e) {
              for (;;)
                switch ((e.prev = e.next)) {
                  case 0:
                    return (
                      (e.next = 2),
                      E.a.get(''.concat(h, '/events'), {
                        headers: { 'x-api-payload': t },
                      })
                    );
                  case 2:
                    if (
                      ((r = e.sent), (n = r.status), (a = r.data), 200 === n)
                    ) {
                      e.next = 8;
                      break;
                    }
                    return (
                      console.error('===>Error to get events', {
                        status: n,
                        data: a,
                      }),
                      e.abrupt('return', null)
                    );
                  case 8:
                    return console.log('===>Boards', a), e.abrupt('return', a);
                  case 10:
                  case 'end':
                    return e.stop();
                }
            }, e);
          }),
        )).apply(this, arguments);
      }
      function H(e, t) {
        return A.apply(this, arguments);
      }
      function A() {
        return (A = Object(l.a)(
          u.a.mark(function e(t, r) {
            var n, a;
            return u.a.wrap(
              function(e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (
                        console.log('Subscribed events', r),
                        (e.prev = 1),
                        (n = r),
                        (e.next = 5),
                        E.a.post(
                          ''.concat(h, '/subscribe'),
                          { events: n },
                          { headers: { 'x-api-payload': t } },
                        )
                      );
                    case 5:
                      if (
                        ((a = e.sent),
                        console.log('==>RET', a),
                        200 === a.status)
                      ) {
                        e.next = 10;
                        break;
                      }
                      return (
                        console.error('ERROR subscribe events', a),
                        e.abrupt('return')
                      );
                    case 10:
                      return e.abrupt('return', a.data.data);
                    case 13:
                      (e.prev = 13),
                        (e.t0 = e.catch(1)),
                        console.error('ERROR: ', e.t0);
                    case 16:
                    case 'end':
                      return e.stop();
                  }
              },
              e,
              null,
              [[1, 13]],
            );
          }),
        )).apply(this, arguments);
      }
      var D = Object(y.a)(function(e) {
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
        U = function(e, t) {
          switch (t.type) {
            case 'FETCH_DONE':
              var r = t.boards || [];
              return Object(j.a)(r);
            case 'RESET':
              return [];
            default:
              return e;
          }
        },
        F = function(e, t) {
          switch (t.type) {
            case 'INIT':
              return Object(j.a)(t.selected);
            case 'TOGGLE':
              var r = t.selected[0],
                n = e;
              return (
                Object(C.indexOf)(e, r) >= 0
                  ? (n = Object(C.filter)(n, function(e) {
                      return r !== e;
                    }))
                  : n.push(r),
                Object(j.a)(n)
              );
            case 'RESET':
              return [];
            default:
              return e;
          }
        },
        G = function() {
          var e = D(),
            t = Object(n.useReducer)(U, []),
            r = Object(i.a)(t, 2),
            c = r[0],
            o = r[1],
            s = Object(n.useReducer)(F, []),
            p = Object(i.a)(s, 2),
            d = p[0],
            b = p[1];
          Object(n.useEffect)(function() {
            (function() {
              var e = Object(l.a)(
                u.a.mark(function e() {
                  var t, r;
                  return u.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            if (
                              ((e.prev = 0),
                              (t = localStorage.getItem('__rid')))
                            ) {
                              e.next = 5;
                              break;
                            }
                            return (
                              o({ type: 'FETCH_DONE', boards: [] }),
                              e.abrupt('return')
                            );
                          case 5:
                            return (e.next = 7), N(t);
                          case 7:
                            (r = e.sent),
                              console.log('==>effect boards', r),
                              o({
                                type: 'FETCH_DONE',
                                boards:
                                  (null === r || void 0 === r
                                    ? void 0
                                    : r.boards) || [],
                              }),
                              b({
                                type: 'INIT',
                                selected:
                                  (null === r || void 0 === r
                                    ? void 0
                                    : r.selected) || [],
                              }),
                              (e.next = 17);
                            break;
                          case 13:
                            (e.prev = 13),
                              (e.t0 = e.catch(0)),
                              console.error(e.t0),
                              o({ type: 'RESET', boards: [] });
                          case 17:
                          case 'end':
                            return e.stop();
                        }
                    },
                    e,
                    null,
                    [[0, 13]],
                  );
                }),
              );
              return function() {
                return e.apply(this, arguments);
              };
            })()();
          }, []);
          var h = function(e) {
              b({ type: 'TOGGLE', selected: [e] });
            },
            v = Object(n.useState)('none'),
            m = Object(i.a)(v, 2),
            E = m[0],
            k = m[1],
            O = Object(n.useCallback)(
              function() {
                (function() {
                  var e = Object(l.a)(
                    u.a.mark(function e() {
                      var t, r;
                      return u.a.wrap(function(e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (
                                k('subscribing'),
                                (t = localStorage.getItem('__rid')),
                                (e.next = 4),
                                H(t || '', d)
                              );
                            case 4:
                              (r = e.sent),
                                console.log('===>Sub ret', r),
                                k('subscribed');
                            case 7:
                            case 'end':
                              return e.stop();
                          }
                      }, e);
                    }),
                  );
                  return function() {
                    return e.apply(this, arguments);
                  };
                })()();
              },
              [d],
            );
          return a.a.createElement(
            'div',
            { className: e.root },
            a.a.createElement(
              T.a,
              { cellHeight: 60, className: e.gridList, cols: 2 },
              c.map(function(t) {
                return a.a.createElement(
                  S.a,
                  { className: e.gridChild, key: t.id, cols: 1 },
                  a.a.createElement(I, {
                    board: t,
                    selected: d,
                    handleSelect: h,
                  }),
                );
              }),
            ),
            a.a.createElement(
              f.a,
              { variant: 'outlined', color: 'primary', onClick: O },
              'Save',
            ),
            a.a.createElement('span', null, E),
          );
        },
        L = function(e) {
          var t = e.status;
          return a.a.createElement(p.b, {
            render: function(e) {
              var r = e.location;
              return 'AUTHED' === t
                ? a.a.createElement(G, null)
                : a.a.createElement(p.a, {
                    to: { pathname: '/auth', state: { from: r } },
                  });
            },
          });
        },
        B = function() {
          var e = Object(n.useState)('INIT'),
            t = Object(i.a)(e, 2),
            r = t[0],
            c = t[1],
            o = localStorage.getItem('__rid');
          return (
            Object(n.useEffect)(function() {
              (function() {
                var e = Object(l.a)(
                  u.a.mark(function e() {
                    return u.a.wrap(function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (e.next = 2), x(o || '');
                          case 2:
                            if (e.sent) {
                              e.next = 6;
                              break;
                            }
                            return c('NOT_AUTHED'), e.abrupt('return');
                          case 6:
                            c('AUTHED');
                          case 7:
                          case 'end':
                            return e.stop();
                        }
                    }, e);
                  }),
                );
                return function() {
                  return e.apply(this, arguments);
                };
              })()();
            }, []),
            a.a.createElement(
              'div',
              { className: 'App' },
              a.a.createElement(
                'header',
                { className: 'App-header' },
                a.a.createElement(
                  'div',
                  {
                    style: { display: 'flex', justifyContent: 'space-around' },
                  },
                  a.a.createElement(
                    p.d,
                    null,
                    a.a.createElement(
                      p.b,
                      { exact: !0, path: '/' },
                      a.a.createElement(L, { status: r }),
                    ),
                    a.a.createElement(
                      p.b,
                      { path: '/auth' },
                      a.a.createElement(g, {
                        title: 'Auth',
                        status: r,
                        handleStatus: c,
                      }),
                    ),
                  ),
                ),
              ),
            )
          );
        },
        W = r(22);
      Boolean(
        'localhost' === window.location.hostname ||
          '[::1]' === window.location.hostname ||
          window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
          ),
      );
      o.a.render(
        a.a.createElement(W.a, null, a.a.createElement(B, null)),
        document.getElementById('root'),
      ),
        'serviceWorker' in navigator &&
          navigator.serviceWorker.ready.then(function(e) {
            e.unregister();
          });
    },
  },
  [[54, 1, 2]],
]);
//# sourceMappingURL=main.8b336f23.chunk.js.map
