const token = "Bearer 3a5a7f90c2bfe85c660f2a8514e4fc63";
const asset = "EQPTZ2501085";
const startDate = "2026-05-22";
const endDate = "2026-05-28";
const techId = "222234064455901199";

const url1 = `http://10.190.0.184:8080/core/api/epm/rpt/eqp-activation/search-activation-detail?size=15&page=1&assetsCode=${asset}&sapCode=&technologyId=${techId}&timeUnit=Hour&myInterestFlag=N&startDate=${startDate}&endDate=${endDate}&isCancelApiLoad=true`;
const url2 = `http://10.190.0.184:8080/core/api/epm/rpt/eqp-activation/eqp/status/analysis?assetsCode=${asset}&sapCode=&technologyId=${techId}&timeUnit=Hour&myInterestFlag=N&startDate=${startDate}&endDate=${endDate}&statisticsMethod=DAY&eqpStatus=IDLE&isCancelApiLoad=true`;

async function testApi() {
  try {
    const res1 = await fetch(url1, { headers: { 'Authorization': token, 'Content-Type': 'application/json' }});
    console.log('--- search-activation-detail ---');
    console.log(JSON.stringify(await res1.json(), null, 2));

    const res3 = await fetch(`http://10.190.0.184:8080/core/api/epmExt/rpt/utilizationRateForOffline?assetsCode=${asset}&sapCode=&technologyId=${techId}&timeUnit=Hour&myInterestFlag=N&startDate=${startDate}&endDate=${endDate}&isCancelApiLoad=true`, { headers: { 'Authorization': token, 'Content-Type': 'application/json' }});
    const url4 = `http://10.190.0.184:8080/core/api/epm/rpt/eqp-activation/eqp/status/analysis?assetsCode=${asset}&sapCode=&technologyId=${techId}&timeUnit=Hour&myInterestFlag=N&startDate=${startDate}&endDate=${endDate}&statisticsMethod=DAY&eqpStatus=DOWN&isCancelApiLoad=true`;
    const res4 = await fetch(url4, { headers: { 'Authorization': token, 'Content-Type': 'application/json' }});
    console.log('--- eqpStatus=DOWN ---');
    console.log(JSON.stringify(await res4.json(), null, 2));
  } catch (err) {
    console.error(err);
  }
}

testApi();
