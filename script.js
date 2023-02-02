document.getElementById('fetch').onclick = async (e) => {
    const token = document.getElementById('token').value;
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    const promises = [
        fetch('https://api.checkproof.com/api/v1/users/me/worktimes?period=this_month', options),
        fetch('https://api.checkproof.com/api/v1/users/me/worktimes?period=prev_month', options),
    ];
    let wt = [];
    try {
        const res = await Promise.all(promises);
        const [wt1, wt2] = await Promise.all(res.map(async res => await res.json()));
        wt = [...wt1, ...wt2];
    } catch (error) {
        alert(error);
        return;
    }

    let days = {};
    let months = 0;
    let currMonth;
    let i = 0;
    while (true) {
        let d = new Date();
        d.setDate(d.getDate() - i++);

        if (currMonth !== undefined && currMonth !== d.getMonth()) months++;
        currMonth = d.getMonth();

        if (months === 2) break;

        if ([0,6].indexOf(d.getDay()) !== -1) {
            continue;
        }
        days[d.toLocaleDateString()] = 0;
    }

    wt.forEach(wt => {
        let d = new Date(wt.work_date_start);
        days[d.toLocaleDateString()] = days[d.toLocaleDateString()] + parseFloat(wt.value);
    });

    const table = document.getElementById('wt');
    table.innerHTML = '';
    for (day in days) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${day}</td>
            <td>${days[day]}</td>
            <td>${8 - days[day]}</td>
        `;
        if (8 - days[day]) tr.classList.add('missing');
        if (8 - days[day] < 0) tr.classList.add('warning');
        table.appendChild(tr)
    }
}
