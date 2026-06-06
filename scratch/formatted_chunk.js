`ALL` && (e = e.filter(e => e.repairPersonnel.includes(_t)))
}
else if (R.type === `human`) {
    if (e = R.data.errors || [], ht) {
        let t = ht.toLowerCase();
        e = e.filter(e => e.symptom.toLowerCase().includes(t) || e.workOrder.toLowerCase().includes(t))
    }
    _t !== `ALL` && (e = e.filter(e => e.symptom.toLowerCase().includes(_t.toLowerCase())))
}
return yt && (e = [...e].sort((e, t) => {
    let n = e[yt],
        r = t[yt];
    return yt === `duration` ? (n = parseInt(e.duration) || 0, r = parseInt(t.duration) || 0) : yt === `unitsProcessed` ? (n = parseInt(e.unitsProcessed) || 0, r = parseInt(t.unitsProcessed) || 0) : yt === `failedUnits` && (n = parseInt(e.failedUnits) || 0, r = parseInt(t.failedUnits) || 0), n < r ? xt === `asc` ? -1 : 1 : n > r ? xt === `asc` ? 1 : -1 : 0
})), e
}, [R, ht, _t, yt, xt]), At = (0, v.useCallback)(e => {
    bt(t => t === e ? (St(e => e === `asc` ? `desc` : `asc`), e) : (St(`asc`), e))
}, []), jt = (0, v.useCallback)(e => {
    if (e === `The device itself`) {
        let e = [`TXYJ03`, `TXYJ12`, `TXYJ05`, `TXYJ10`],
            t = Et.filter(t => e.includes(t.code)),
            n = {};
        t.forEach(e => {
            e.operator && (n[e.operator] = (n[e.operator] || 0) + 1)
        });
        let r = Object.keys(n).map(e => {
                let r = n[e],
                    i = t.length > 0 ? `${(r/t.length*100).toFixed(1)}%` : `0%`,
                    a = e.split(` `),
                    o = ``;
                return a.length > 0 && (o += a[0][0]), a.length > 1 && (o += a[1][0]), {
                    operator: e,
                    count: r,
                    rate: i,
                    initials: o.toUpperCase()
                }
            }).sort((e, t) => t.count - e.count),
            i = t.length,
            a = t.reduce((e, t) => e + (parseInt(t.duration) || 0), 0);
        mt({
            type: `device`,
            data: {
                code: `The device itself`,
                name: `Hardware Exception Logs`,
                description: `All records belonging to "The device itself" (Hardware Exception) category.`,
                totalIncidents: i,
                standardRepairTime: 40,
                avgDuration: i > 0 ? Math.round(a / i) : 0,
                topOperators: r,
                incidentHistory: t.map(e => ({
                    ...e,
                    duration: `${e.duration} mins`
                }))
            }
        }), pt(!0)
    } else if (e === `OTHER`) {
        let e = [`TXRJ54`],
            t = Et.filter(t => e.includes(t.code)),
            n = {};
        t.forEach(e => {
            e.operator && (n[e.operator] = (n[e.operator] || 0) + 1)
        });
        let r = Object.keys(n).map(e => {
                let r = n[e],
                    i = t.length > 0 ? `${(r/t.length*100).toFixed(1)}%` : `0%`,
                    a = e.split(` `),
                    o = ``;
                return a.length > 0 && (o += a[0][0]), a.length > 1 && (o += a[1][0]), {
                    operator: e,
                    count: r,
                    rate: i,
                    initials: o.toUpperCase()
                }
            }).sort((e, t) => t.count - e.count),
            i = t.length,
            a = t.reduce((e, t) => e + (parseInt(t.duration) || 0), 0);
        mt({
            type: `device`,
            data: {
                code: `OTHER`,
                name: `Software Exception Logs`,
                description: `All records belonging to "OTHER" (Software Exception) category.`,
                totalIncidents: i,
                standardRepairTime: 70,
                avgDuration: i > 0 ? Math.round(a / i) : 0,
                topOperators: r,
                incidentHistory: t.map(e => ({
                    ...e,
                    duration: `${e.duration} mins`
                }))
            }
        }), pt(!0)
    }
}, [Et]), Mt = (0, v.useCallback)(e => {
    let t = parseInt(e) || 0,
        n = R && R.data && R.data.standardRepairTime ? R.data.standardRepairTime : 40;
    return t <= n ? {
        color: S ? `#15803d` : `#4ade80`,
        fontWeight: `600`
    } : t <= n * 1.2 ? {
        color: S ? `#b45309` : `#fde047`,
        fontWeight: `600`
    } : t <= n * 1.5 ? {
        color: S ? `#c2410c` : `#fb923c`,
        fontWeight: `600`
    } : {
        color: S ? `#b91c1c` : `#f87171`,
        fontWeight: `600`
    }
}, [S, R]);
(0, v.useCallback)(() => ({
    color: S ? `#4338ca` : `#a5b4fc`,
    fontWeight: `500`
}), [S]);
let Nt = (0, v.useCallback)(() => ({
        color: S ? `#0f766e` : `#99f6e4`,
        fontWeight: `500`
    }), [S]),
    Pt = (0, v.useCallback)((e, t) => (0, Q.jsxs)(`th`, {
        style: {
            cursor: `pointer`,
            userSelect: `none`
        },
        onClick: () => At(t),
        children: [e, yt === t && (xt === `asc` ? ` ▲` : ` ▼`)]
    }), [yt, xt, At]),
    Ft = async (e, t, n) => {
        let r = !!window.electronAPI,
            i = `${r?`http://10.190.0.184:8080`:``}${e}`;
        if (r) {
            let e = await window.electronAPI.fetchDowntimeData(i, n, t);
            if (e.error) throw Error(e.message || e.status);
            return e.data
        } else {
            let e = new URLSearchParams(t).toString(),
                r = await fetch(`${i}?${e}`, {
                    method: `GET`,
                    headers: {
                        Authorization: n
                    }
                });
            if (!r.ok) throw Error(`HTTP Error ${r.status}: ${r.statusText}`);
            return await r.json()
        }
    }, It = (0, v.useCallback)(e => {
        if (!d) f(e), m(e);
        else {
            let t = d,
                n = e;
            n < t && ([t, n] = [n, t]), o(t), c(n), f(null), m(null), u(!1)
        }
    }, [d]), Lt = (0, v.useCallback)(e => {
        d && m(e)
    }, [d]), Rt = (0, v.useCallback)(() => {
        be([]), Se([]), we([]), Ee([]), De([]), ke([]), je([]), Ne(null), Fe(null), Le([]), ze([]), Ve([]), Ue([]), Ge({}), qe([]), Ze([`ALL`]), st(`pie`), lt(null)
    }, []), zt = async () => {
        if (!n) {
            t(!1), ge(`Analysis cancelled: Bearer Token is required. Please login.`);
            return
        }
        fe(!0), ge(``), ve(``), Rt();
        let e = le.split(/[\s,;]+/).filter(e => e.trim().length > 0);
        if (e.length === 0 && ce && (e = Object.keys(EZ).filter(e => EZ[e]?.station === ce)), e.length === 0) {
            ge(`No assets found. Please provide asset codes or select a valid station.`), fe(!1);
            return
        }
        me({
            current: 0,
            total: e.length
        });
        try {
            let r = [],
                i = {},
                a = 0,
                o = 0,
                s = 0,
                c = 0,
                l = 0,
                u = [],
                d = async (e, t) => {
                    try {
                        return await Ft(e, t, n)
                    } catch (e) {
                        return u.push(e), null
                    }
                };
            for (let t = 0; t < e.length; t += 5) {
                t > 0 && await new Promise(e => setTimeout(e, 200));
                let n = e.slice(t, t + 5).map(async e => {
                        let t = {
                                assetsCode: e,
                                sapCode: ``,
                                technologyId: `222234064455901199`,
                                timeUnit: `Hour`,
                                myInterestFlag: `N`,
                                startDate: k,
                                endDate: se,
                                isCancelApiLoad: `true`,
                                statisticsMethod: `DAY`
                            },
                            [n, r, u, f, p] = await Promise.all([d(`/core/api/epm/rpt/eqp-activation/eqp/status/analysis`, {
                                ...t,
                                eqpStatus: `RUN`,
                                firstDeptId: ``
                            }), d(`/core/api/epm/rpt/eqp-activation/eqp/status/analysis`, {
                                ...t,
                                eqpStatus: `IDLE`,
                                firstDeptId: ``
                            }), d(`/core/api/epm/rpt/eqp-activation/eqp/status/analysis`, {
                                ...t,
                                eqpStatus: `DOWN`,
                                firstDeptId: ``
                            }), d(`/core/api/epm/rpt/eqp-activation/eqp/status/analysis`, {
                                ...t,
                                eqpStatus: `PM`,
                                firstDeptId: ``
                            }), d(`/core/api/epmExt/rpt/utilizationRateForOffline`, t)]),
                            m = 0,
                            h = {},
                            g = n?.data?.eqpStatusAnalysisList || [];
                        g.length > 0 && (m = g.reduce((e, t) => e + (parseFloat(t.value) || 0), 0) / g.length * 100), g.forEach(e => {
                            e?.key && (h[e.key] = (parseFloat(e.value) || 0) * 100)
                        });
                        let _ = 0,
                            v = {},
                            y = r?.data?.eqpStatusAnalysisList || [];
                        y.length > 0 && (_ = y.reduce((e, t) => e + (parseFloat(t.value) || 0), 0) / y.length * 100), y.forEach(e => {
                            e?.key && (v[e.key] = (parseFloat(e.value) || 0) * 100)
                        });
                        let b = 0,
                            x = 0,
                            S = {},
                            C = u?.data?.eqpStatusAnalysisList || [];
                        if (C.length > 0) {
                            let e = C.reduce((e, t) => e + (parseFloat(t.value) || 0), 0);
                            b = e / C.length * 100, x = e * 24
                        }
                        C.forEach(e => {
                            e?.key && (S[e.key] = (parseFloat(e.value) || 0) * 100)
                        });
                        let w = 0,
                            T = {},
                            E = f?.data?.eqpStatusAnalysisList || [];
                        E.length > 0 && (w = E.reduce((e, t) => e + (parseFloat(t.value) || 0), 0) / E.length * 100), E.forEach(e => {
                            e?.key && (T[e.key] = (parseFloat(e.value) || 0) * 100)
                        });
                        let D = p?.data?.timeUseRate || 0,
                            O = p?.data?.totalTimeUseRate || 0,
                            A = p?.data?.runningTimeHour || 0,
                            j = x;
                        (g.length > 0 || y.length > 0 || C.length > 0 || E.length > 0) && (i[e] = {
                            dailyRun: {
                                ...h
                            },
                            dailyIdle: {
                                ...v
                            },
                            dailyDown: {
                                ...S
                            },
                            dailyPm: {
                                ...T
                            },
                            runRecords: g.map(e => ({
                                key: e.key,
                                value: parseFloat(e.value) || 0
                            })),
                            idleRecords: y.map(e => ({
                                key: e.key,
                                value: parseFloat(e.value) || 0
                            })),
                            downRecords: C.map(e => ({
                                key: e.key,
                                value: parseFloat(e.value) || 0
                            })),
                            pmRecords: E.map(e => ({
                                key: e.key,
                                value: parseFloat(e.value) || 0
                            })),
                            utilData: {
                                actualUtil: D,
                                overallUtil: O,
                                runTimeHr: A,
                                downTimeHr: j
                            }
                        }, a++), o += D, s += O, c += j, l += A;
                        let M = EZ[e] || {},
                            N = p?.data?.deviceLocation || p?.data?.assetLocation || p?.data?.location || ``;
                        return {
                            asset: e,
                            downtime: x,
                            actualUtil: D,
                            overallUtil: O,
                            runRatio: m,
                            idleRatio: _,
                            downRatio: b,
                            pmRatio: w,
                            runTimeHr: A,
                            sapCode: M.sapCode || p?.data?.sapCode || ``,
                            name: M.name || p?.data?.assetsName || ``,
                            station: M.station || ce,
                            site: M.site || ``,
                            type: M.type || ``,
                            model: M.model || ``,
                            abbreviation: M.abbreviation || e,
                            location: N || M.location || ``
                        }
                    }),
                    u = await Promise.all(n);
                r.push(...u), me({
                    current: Math.min(t + 5, e.length),
                    total: e.length
                })
            }
            if (a === 0) {
                if (Rt(), Tt.current = {}, Dt.current = [], u.length > 0) {
                    let e = u[0].message || u[0].toString();
                    e.includes(`401`) || e.toLowerCase().includes(`token expired`) || e.toLowerCase().includes(`invalid`) || e.toLowerCase().includes(`unauthorized`) ? (t(!1), sessionStorage.removeItem(`pareto_bearer_token`), localStorage.removeItem(`pareto_bearer_token`), ge(`Connection Error 401: Unauthorized. The Bearer Token has expired. Please login again.`)) : ge(`Connection Error: ${e}. Unable to retrieve data from the server (10.190.0.184).`)
                } else ge(`No Data: No records found for the selected station or asset codes in this date range.`);
                fe(!1);
                return
            }
            Tt.current = i, Dt.current = r, Ze([`ALL`]), r.sort((e, t) => t.downtime - e.downtime);
            let f = r.reduce((e, t) => e + t.downtime, 0),
                p = 0;
            be(r.map(e => {
                p += e.downtime;
                let t = f > 0 ? p / f * 100 : 0;
                return {
                    ...e,
                    downtimeStr: e.downtime.toFixed(2),
                    cumulativePercentage: parseFloat(t.toFixed(2))
                }
            })), Se(r), Bt(`ALL`, i, r, a), ve(`Successfully processed ${a} assets.`)
        } catch (e) {
            ge(e.message)
        } finally {
            fe(!1)
        }
    }, Bt = (0, v.useCallback)((e, t, n, r) => {
        let i = t || Tt.current;
        n || Dt.current;
        let o = Object.keys(i);
        if (o.length === 0) return;
        let c;
        c = Array.isArray(e) ? e.includes(`ALL`) || e.length === 0 ? o : e : e === `ALL` ? o : [e];
        let l = {},
            u = {},
            d = {},
            f = {},
            p = 0,
            m = 0,
            h = 0,
            g = 0,
            _ = 0,
            v = 0,
            y = 0,
            b = 0,
            x = 0,
            S = 0,
            C = 0,
            w = 0,
            T = 0;
        c.forEach(e => {
            let t = i[e];
            t && (T++, Object.entries(t.dailyRun).forEach(([e, t]) => {
                l[e] || (l[e] = []), l[e].push(t)
            }), Object.entries(t.dailyIdle).forEach(([e, t]) => {
                u[e] || (u[e] = []), u[e].push(t)
            }), Object.entries(t.dailyDown).forEach(([e, t]) => {
                d[e] || (d[e] = []), d[e].push(t)
            }), Object.entries(t.dailyPm).forEach(([e, t]) => {
                f[e] || (f[e] = []), f[e].push(t)
            }), t.runRecords.forEach(e => {
                p += e.value * 100, m++
            }), t.idleRecords.forEach(e => {
                h += e.value * 100, g++
            }), t.downRecords.forEach(e => {
                _ += e.value * 100, v++
            }), t.pmRecords.forEach(e => {
                y += e.value * 100, b++
            }), x += t.utilData.actualUtil, S += t.utilData.overallUtil, C += t.utilData.downTimeHr, w += t.utilData.runTimeHr)
        });
        let E = e => Object.keys(e).sort().map(t => {
                let n = (e[t] || []).filter(e => !isNaN(e)),
                    r = n.length > 0 ? n.reduce((e, t) => e + t, 0) / n.length : 0;
                return {
                    date: t,
                    value: parseFloat(r.toFixed(3))
                }
            }),
            D = E(l),
            O = E(u),
            k = E(d),
            A = E(f);
        we(D.map(e => ({
            ...e,
            target: FZ.RUN.target
        }))), Ee(O.map(e => ({
            ...e,
            target: FZ.IDLE.target
        }))), De(k.map(e => ({
            ...e,
            target: FZ.DOWN.target
        }))), ke(A.map(e => ({
            ...e,
            target: FZ.PM.target
        })));
        let j = m > 0 ? parseFloat((p / m).toFixed(3)) : 0,
            M = g > 0 ? parseFloat((h / g).toFixed(3)) : 0,
            N = v > 0 ? parseFloat((_ / v).toFixed(3)) : 0,
            ee = b > 0 ? parseFloat((y / b).toFixed(3)) : 0;
        T > 0 && (Ne({
            run: j,
            idle: M,
            down: N,
            pm: ee
        }), Fe({
            totalNum: T,
            avgActualUtil: parseFloat((x / T).toFixed(1)),
            avgOverallUtil: parseFloat((S / T).toFixed(1)),
            totalDowntimeHrs: parseFloat(C.toFixed(1)),
            totalRunTimeHrs: parseFloat(w.toFixed(1))
        }));
        let te = {};
        c.forEach(e => {
            let t = i[e];
            t && Object.entries(t.dailyRun).forEach(([t, n]) => {
                te[t] || (te[t] = {
                    normalOutputActual: 0,
                    reworkOutputActual: 0,
                    normalOutputStandard: 0,
                    reworkOutputStandard: 0
                });
                let r = NZ(e, t, n);
                te[t].normalOutputActual += r.normalOutputActual, te[t].reworkOutputActual += r.reworkOutputActual, te[t].normalOutputStandard += r.normalOutputStandard, te[t].reworkOutputStandard += r.reworkOutputStandard
            })
        }), je(Object.entries(te).sort().map(([e, t]) => ({
            date: e,
            ...t
        }))), Le(Object.keys(u).sort().map(e => {
            let t = (u[e] || []).filter(e => !isNaN(e)),
                n = (t.length > 0 ? t.reduce((e, t) => e + t, 0) / t.length : 0) / 100 * 24 * Math.max(1, T);
            return {
                date: e,
                idleHours: parseFloat(n.toFixed(3)),
                "Wait Material": parseFloat((n * .4).toFixed(3)),
                "Wait Operator": parseFloat((n * .25).toFixed(3)),
                "No Plan": parseFloat((n * .2).toFixed(3)),
                Others: parseFloat((n * .15).toFixed(3))
            }
        }));
        let P = 0;
        c.forEach(e => {
            let t = i[e];
            t && (P += t.utilData.downTimeHr)
        });
        let F = P > 0 ? P : 10;
        ze([{
            name: `Mechanical`,
            value: parseFloat((F * .45).toFixed(2)),
            color: `#ff3250`
        }, {
            name: `Electrical/Sensor`,
            value: parseFloat((F * .25).toFixed(2)),
            color: `#ff7675`
        }, {
            name: `Software`,
            value: parseFloat((F * .18).toFixed(2)),
            color: `#74b9ff`
        }, {
            name: `Tooling`,
            value: parseFloat((F * .08).toFixed(2)),
            color: `#a29bfe`
        }, {
            name: `Others`,
            value: parseFloat((F * .04).toFixed(2)),
            color: `#dfe6e9`
        }]);
        let ne = {
                "The device itself": 0,
                "Human causes": 0,
                "Raw material": 0,
                "Abnormal incoming materials": 0,
                OTHER: 0
            },
            re = {
                "The device itself": {},
                "Human causes": {},
                "Raw material": {},
                "Abnormal incoming materials": {},
                OTHER: {}
            },
            ie = {
                "Hardware Exception": `The device itself`,
                硬件异常: `The device itself`,
                "The device itself": `The device itself`,
                "Software Exception": `OTHER`,
                软件异常: `OTHER`,
                "Personnel Misoperation": `Human causes`,
                人员误操作: `Human causes`,
                "Human causes": `Human causes`,
                "Material Exception": `Raw material`,
                物料异常: `Raw material`,
                "Raw material": `Raw material`,
                效验异常: `Abnormal incoming materials`,
                "Abnormal incoming materials": `Abnormal incoming materials`,
                切机调试: `OTHER`,
                OTHER: `OTHER`
            };
        c.forEach(e => {
            let t = OZ[e];
            if (t) {
                Object.keys(t).forEach(e => {
                    if (e >= a && e <= s) {
                        let n = t[e];
                        Object.keys(n).forEach(e => {
                            let t = ie[e] || `OTHER`,
                                r = n[e];
                            typeof r == `object` && r && Object.keys(r).forEach(e => {
                                let n = parseFloat(r[e]) || 0;
                                ne[t] += n, re[t][e] || (re[t][e] = 0), re[t][e] += n
                            })
                        })
                    }
                });
                return
            }
            let n = DZ[e];
            n && Object.keys(n).forEach(e => {
                if (e >= a && e <= s) {
                    let t = n[e];
                    Object.keys(t).forEach(e => {
                        let n = t[e],
                            r = ie[e] || e;
                        if (ne[r] !== void 0) {
                            let e = parseFloat(n.total) || 0;
                            ne[r] += e, n.codes && Object.keys(n.codes).forEach(e => {
                                let t = parseFloat(n.codes[e]) || 0;
                                re[r][e] || (re[r][e] = 0), re[r][e] += t
                            })
                        }
                    })
                }
            })
        });
        let ae = Object.values(ne).reduce((e, t) => e + t, 0);
        console.log(`[OutputFault Debug]`, {
            totalFaultsCount: ae,
            categoryCounts: ne,
            targetAssetsCount: c.length,
            sampleAssets: c.slice(0, 5),
            pickerStart: a,
            pickerEnd: s
        });
        let oe = [{
            name: `The device itself`,
            value: ae > 0 ? parseFloat((ne[`The device itself`] / ae * 100).toFixed(2)) : 0,
            realValue: ae > 0 ? parseFloat((ne[`The device itself`] / ae * 100).toFixed(2)) : 0,
            count: ne[`The device itself`],
            color: `#5470c6`
        }, {
            name: `Human causes`,
            value: ae > 0 ? parseFloat((ne[`Human causes`] / ae * 100).toFixed(2)) : 0,
            realValue: ae > 0 ? parseFloat((ne[`Human causes`] / ae * 100).toFixed(2)) : 0,
            count: ne[`Human causes`],
            color: `#91cc75`
        }, {
            name: `Raw material`,
            value: ae > 0 ? parseFloat((ne[`Raw material`] / ae * 100).toFixed(2)) : 0,
            realValue: ae > 0 ? parseFloat((ne[`Raw material`] / ae * 100).toFixed(2)) : 0,
            count: ne[`Raw material`],
            color: `#fac858`
        }, {
            name: `Abnormal incoming materials`,
            value: ae > 0 ? parseFloat((ne[`Abnormal incoming materials`] / ae * 100).toFixed(2)) : 0,
            realValue: ae > 0 ? parseFloat((ne[`Abnormal incoming materials`] / ae * 100).toFixed(2)) : 0,
            count: ne[`Abnormal incoming materials`],
            color: `#ee6666`
        }, {
            name: `OTHER`,
            value: ae > 0 ? parseFloat((ne.OTHER / ae * 100).toFixed(2)) : 0,
            realValue: ae > 0 ? parseFloat((ne.OTHER / ae * 100).toFixed(2)) : 0,
            count: ne.OTHER,
            color: `#73c0de`
        }];
        Ve(oe);
        let se = oe.filter(e => e.count > 0).sort((e, t) => t.count - e.count),
            ce = 0,
            I = se.reduce((e, t) => e + t.count, 0);
        Ue(se.map(e => (ce += e.count, {
            ...e,
            value: e.count,
            cumulativePercentage: I > 0 ? parseFloat((ce / I * 100).toFixed(2)) : 0
        })));
        let le = {};
        Object.keys(re).forEach(e => {
            let t = Object.keys(re[e]).map(t => {
                    let n = re[e][t],
                        r = `Unknown fault code description`;
                    return kZ !== void 0 && kZ[t] ? r = kZ[t] : GZ !== void 0 && GZ[t] && (r = GZ[t].name), {
                        name: t,
                        desc: r,
                        value: n
                    }
                }).sort((e, t) => t.value - e.value),
                n = 0,
                r = t.reduce((e, t) => e + t.value, 0);
            le[e] = t.map(e => (n += e.value, {
                ...e,
                cumulativePercentage: r > 0 ? parseFloat((n / r * 100).toFixed(2)) : 0
            }))
        }), Ge(le)
    }, [a, s]), Vt = (0, v.useCallback)(e => {
        Ze(t => {
            let n = [];
            if (e === `ALL`) n = [`ALL`];
            else {
                let r = t.filter(e => e !== `ALL`);
                n = r.includes(e) ? r.filter(t => t !== e) : [...r, e], n.length === 0 && (n = [`ALL`])
            }
            return Bt(n), n
        })
    }, [Bt]), Ht = (0, v.useCallback)((e, t, n) => {
        let r = Tt.current;
        if (!r || Object.keys(r).length === 0) {
            alert(`No data available to export. Please generate analysis first.`);
            return
        }
        let i = Object.keys(r),
            a;
        if (a = Xe.includes(`ALL`) ? i : Xe.filter(e => i.includes(e)), a.length === 0) {
            alert(`No active assets selected for export or no data found for selected assets.`);
            return
        }
        let o = new Set;
        a.forEach(t => {
            r[t] && r[t][e] && Object.keys(r[t][e]).forEach(e => o.add(e))
        });
        let s = Array.from(o).sort();
        if (s.length === 0) {
            alert(`No daily data found for the selected assets and date range for ${n} trend.`);
            return
        }
        let c = [`Date`, `KPI Target (%)`, ...a],
            l = s.map(n => {
                let i = {
                    Date: n,
                    "KPI Target (%)": t.target
                };
                return a.forEach(t => {
                    let a = 0;
                    r[t] && r[t][e] && r[t][e][n] !== void 0 && (a = r[t][e][n]), i[t] = parseFloat(a.toFixed(2))
                }), i
            }),
            u = SZ.json_to_sheet(l, {
                header: c
            }),
            d = SZ.book_new();
        SZ.book_append_sheet(d, u, `Trend - ${n}`), nZ(d, `${n}_Trend_Analysis.xlsx`)
    }, [Xe, Tt]), Ut = (0, v.useCallback)(() => {
        if (!xe || xe.length === 0) {
            alert(`No equipment details data to export.`);
            return
        }
        let e = [`Index`, `Assets No`, `SAP Code`, `Equipment Name`, `Utilization rate`, `Duration Of Downtime`, `Run Time`, `Station`, `Site`, `Equipment Type`, `Equipment Model`, `Equipment Abbreviation`, `Device Location`],
            t = [];
        t.push(e.join(`,`)), xe.forEach((e, n) => {
            let r = [n + 1, `"${e.asset}"`, `"${e.sapCode}"`, `"${e.name}"`, `${e.actualUtil?.toFixed(3)||0}%`, `${e.downtime?.toFixed(2)||0}`, `${e.runTimeHr?.toFixed(2)||0}`, `"${e.station}"`, `"${e.site}"`, `"${e.type}"`, `"${e.model}"`, `"${e.abbreviation}"`, `"${e.location}"`];
            t.push(r.map(e => typeof e == `string` && e.includes(`,`) ? `"${e}"` : e).join(`,`))
        });
        let n = t.join(`
`),
            r = new Blob([n], {
                type: `text/csv;charset=utf-8;`
            }),
            i = document.createElement(`a`);
        if (i.download !== void 0) {
            let e = URL.createObjectURL(r);
            i.setAttribute(`href`, e), i.setAttribute(`download`, `Equipment_Details.csv`), i.style.visibility = `hidden`, document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(e)
        }
    }, [xe]), Wt = (0, v.useCallback)(() => {
        let e = [],
            t = ``,
            n = ``;
        if (it === `maintenance`) {
            if (!Re || Re.length === 0) {
                alert(`No Maintenance Fault Causes data to export.`);
                return
            }
            e = Re.map(e => ({
                Category: e.name,
                "Proportion (%)": (e.value / Re.reduce((e, t) => e + t.value, 0) * 100).toFixed(2)
            })), t = `Maintenance Faults`, n = `Maintenance_Fault_Causes.xlsx`
        } else if (ct) {
            let r = We[ct];
            if (!r || r.length === 0) {
                alert(`No Fault Codes data to export.`);
                return
            }
            e = r.map(e => ({
                "Fault Code": e.name,
                Description: e.desc,
                Value: e.value,
                "Cumulative (%)": parseFloat(e.cumulativePercentage).toFixed(2)
            })), t = `Fault Codes`, n = `Output_Fault_Codes_${ct}.xlsx`
        } else {
            if (!He || He.length === 0) {
                alert(`No Output Fault Categories data to export.`);
                return
            }
            e = He.map(e => ({
                Category: e.name,
                Value: e.value,
                "Cumulative (%)": parseFloat(e.cumulativePercentage).toFixed(2)
            })), t = `Output Faults`, n = `Output_Fault_Categories.xlsx`
        }
        let r = SZ.json_to_sheet(e),
            i = SZ.book_new();
        SZ.book_append_sheet(i, r, t), nZ(i, n)
    }, [it, Re, He, We, ct]), [z, Gt] = (0, v.useState)({
        key: null,
        direction: `asc`
    }), Kt = (0, v.useCallback)(e => {
        Gt(t => t.key === e ? {
            key: e,
            direction: t.direction === `asc` ? `desc` : `asc`
        } : {
            key: e,
            direction: `desc`
        })
    }, []), qt = (0, v.useMemo)(() => z.key ? [...xe].sort((e, t) => {
        let n = e[z.key],
            r = t[z.key];
        return n === void 0 && (n = 0), r === void 0 && (r = 0), n < r ? z.direction === `asc` ? -1 : 1 : n > r ? z.direction === `asc` ? 1 : -1 : 0
    }) : xe, [xe, z]);
return (0, Q.jsxs)(Q.Fragment, {
            children: [(0, Q.jsx)(`div`, {
                        className: `title-bar`
                    }), (0, Q.jsxs)(`div`, {
                            className: `app-container`,
                            children: [!e && (0, Q.jsx)(HZ, {
                                        setToken: r,
                                        setIsAuthenticated: t
                                    }), (0, Q.jsx)(`header`, {
                                        className: `app-header`,
                                        children: (0, Q.jsxs)(`div`, {
                                            className: `header-content`,
                                            children: [(0, Q.jsxs)(`div`, {
                                                className: `header-left`,
                                                children: [(0, Q.jsx)(`button`, {
                                                    className: `sidebar-toggle-btn`,
                                                    onClick: () => y(e => !e),
                                                    title: `Toggle sidebar`,
                                                    children: (0, Q.jsx)(`span`, {
                                                        className: `toggle-icon`,
                                                        children: `☰`
                                                    })
                                                }), (0, Q.jsx)(`div`, {
                                                    className: `logo-icon`,
                                                    children: (0, Q.jsx)(`img`, {
                                                        src: wZ,
                                                        alt: `EPMS Logo`,
                                                        style: {
                                                            width: `28px`,
                                                            height: `28px`,
                                                            borderRadius: `6px`
                                                        }
                                                    })
                                                }), (0, Q.jsx)(`h1`, {
                                                    children: `DownTime Management`
                                                })]
                                            }), (0, Q.jsxs)(`div`, {
                                                className: `header-right`,
                                                children: [(0, Q.jsxs)(`span`, {
                                                    className: `status-badge`,
                                                    style: {
                                                        backgroundColor: `rgba(16, 185, 129, 0.2)`,
                                                        color: `#10b981`
                                                    },
                                                    children: [(0, Q.jsx)(`span`, {
                                                        className: `dot`,
                                                        style: {
                                                            backgroundColor: `#10b981`
                                                        }
                                                    }), ` Live Data`]
                                                }), (0, Q.jsxs)(`button`, {
                                                    className: `theme-toggle-btn`,
                                                    onClick: () => C(e => !e),
                                                    title: `Toggle Theme`,
                                                    children: [S ? (0, Q.jsx)(ne, {
                                                        size: 16
                                                    }) : (0, Q.jsx)(oe, {
                                                        size: 16
                                                    }), S ? `Dark` : `Light`]
                                                }), e && (0, Q.jsxs)(`button`, {
                                                    className: `logout-btn`,
                                                    onClick: i,
                                                    children: [(0, Q.jsx)(te, {
                                                        size: 16
                                                    }), ` Logout`]
                                                })]
                                            })]
                                        })
                                    }), (0, Q.jsxs)(`main`, {
                                            className: `main-content`,
                                            children: [(0, Q.jsxs)(`div`, {
                                                            style: {
                                                                display: `flex`,
                                                                zIndex: 20,
                                                                position: `relative`
                                                            },
                                                            children: [(0, Q.jsx)(`aside`, {
                                                                            className: `left-sidebar ${_?`sidebar-open`:`sidebar-closed`}`,
                                                                            children: (0, Q.jsx)(`div`, {
                                                                                        className: `sidebar-inner`,
                                                                                        children: (0, Q.jsxs)(`div`, {
                                                                                                    className: `controls-group`,
                                                                                                    children: [(0, Q.jsxs)(`div`, {
                                                                                                                className: `input-group`,
                                                                                                                children: [(0, Q.jsx)(`label`, {
                                                                                                                    children: `Station`
                                                                                                                }), (0, Q.jsxs)(`div`, {
                                                                                                                    className: `select-wrapper`,
                                                                                                                    children: [(0, Q.jsx)(`select`, {
                                                                                                                        value: ce,
                                                                                                                        onChange: e => I(e.target.value),
                                                                                                                        children: PZ.map(e => (0, Q.jsx)(`option`, {
                                                                                                                            value: e,
                                                                                                                            children: e
                                                                                                                        }, e))
                                                                                                                    }), (0, Q.jsx)(j, {
                                                                                                                        className: `select-icon`,
                                                                                                                        size: 16
                                                                                                                    })]
                                                                                                                })]
                                                                                                            }), (0, Q.jsxs)(`div`, {
                                                                                                                className: `input-group`,
                                                                                                                children: [(0, Q.jsx)(`label`, {
                                                                                                                    children: `Asset Codes`
                                                                                                                }), (0, Q.jsx)(`textarea`, {
                                                                                                                    rows: 5,
                                                                                                                    value: le,
                                                                                                                    onChange: e => ue(e.target.value),
                                                                                                                    placeholder: `Comma separated, e.g. EQPTZ2501066`
                                                                                                                })]
                                                                                                            }), (0, Q.jsxs)(`div`, {
                                                                                                                    className: `input-group date-picker-group`,
                                                                                                                    ref: w,
                                                                                                                    children: [(0, Q.jsx)(`label`, {
                                                                                                                                children: `Date Range`
                                                                                                                            }), (0, Q.jsxs)(`div`, {
                                                                                                                                className: `date-display`,
                                                                                                                                onClick: () => u(!l),
                                                                                                                                children: [(0, Q.jsx)(`span`, {
                                                                                                                                    children: k || `Select start`
                                                                                                                                }), (0, Q.jsx)(`span`, {
                                                                                                                                    className: `separator`,
                                                                                                                                    children: `→`
                                                                                                                                }), (0, Q.jsx)(`span`, {
                                                                                                                                    children: se || `Select end`
                                                                                                                                })]
                                                                                                                            }), l && (0, Q.jsxs)(`div`, {
                                                                                                                                    className: `calendar-dropdown`,
                                                                                                                                    children: [(0, Q.jsxs)(`div`, {
                                                                                                                                                    className: `calendar-header`,
                                                                                                                                                    children: [(0, Q.jsx)(`button`, {
                                                                                                                                                                onClick: () => {
                                                                                                                                                                    let e = new Date(h);
                                                                                                                                                                    e.setMonth(e.getMonth() - 1), g(e)
                                                                                                                                                                },
                                                                                                                                                                children: `◀`
                                                                                                                                                            }), (0, Q.jsx)(`span`, {
                                                                                                                                                                    children: h.toLocaleString(`defau