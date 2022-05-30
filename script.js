class cityInfo {
    constructor() {
        let db = indexedDB.open('cityInfo', 1);
        db.onupgradeneeded = () => {
            let dbResult = db.result;
            let createStore = dbResult.createObjectStore('data', { autoIncrement: true });
        }
        this.url = "https://countriesnow.space/api/v0.1/countries/population/cities";
        this.tableData = 0;
        this.allData = "";
    }
    fetchData() {
        let x = localStorage.getItem("isFirstTime")
        if (x === "true") {
            this.readFromDb()
        } else {
            fetch(this.url)
                .then(res => res.json())
                .then(data => {
                    this.saveToIdb(data)
                }).catch(err => {
                    alert("Oops! something went wrong")
                });
        }
    }
    saveToIdb(data) {
        let db = indexedDB.open('cityInfo', 1);
        db.onsuccess = () => {
            let dbResult = db.result;
            let tx = dbResult.transaction('data', 'readwrite');
            let store = tx.objectStore('data')
            store.put(data) ? localStorage.setItem("isFirstTime", "true") : console.log("Something wrong happen");
            this.readFromDb()
            console.log("dataSaved");
        }
        db.onerror = () => {
            console.log(db.error);
        }

    }
    readFromDb() {
        let db = indexedDB.open('cityInfo', 1);
        db.onsuccess = () => {
            let result = db.result;
            let tx = result.transaction('data', 'readonly');
            let store = tx.objectStore('data');
            let get = store.getAll();
            get.onsuccess = () => {
                let res = get.result;
                this.allData = res;
                this.genTableFromData(res)
            }
            db.onerror = () => {
                console.log("object");
            }
        }
    }
    genTableFromData(data) {
        let table = data[0].data.map((cur, i) => {
            let pcount = cur.populationCounts;
            let pcountMap = pcount.map((cur1, j) => {
                return (
                    `<table>
                    <thead>
                    <tr>
                    <th>Year</th>
                    <th>Value</th>
                    <th>Sex</th>
                    <th>Reliabilty</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${cur1.year}</td>
                    <td>${cur1.value}</td>
                    <td>${cur1.sex}</td>
                    <td>${cur1.reliabilty}</td>
                    </tr>
                    </tbody>
                    
                    </table>
                    `
                )
            })
            return (`
            <table>
            <thead>
            <tr>
            <th>City</th>
            <th>Country</th>
            </tr>
            </thead>
            <tbody>
            <tr><td>${cur.city}</td><td>${cur.country}</td></tr>
            </tbody>
            </table>
            ${pcountMap.join("")}`);
        })
        this.tableData = table;
    }

}
const ptable = document.querySelector(".population-table");
const a = new cityInfo();
let dt = a.fetchData();

function displayDataInPage() {
    let it = setInterval(() => {
        if (Array.isArray(a.tableData)) {
            clearInterval(it);
            // console.log(a.tableData[0]);
            if (a.tableData[0] === undefined) {
                ptable.innerHTML = `
                <h3>Results not found\n Try another keyword</h3>
                `;
            } else {
                ptable.innerHTML = `
            ${a.tableData[0]} \n
           <div class="prev-next-btn"> <button class = "prev" onclick="prevNext(0)">Prev</button><span class="index">0/${a.tableData.length-1}</span>
            <button class="next" onclick="prevNext(1)">Next</button></div>
            `
            }
        }
    }, 0);
}
displayDataInPage();

function prevNext(index) {
    if (a.tableData[index] != undefined) {
        ptable.innerHTML = `
            ${a.tableData[index]}
            \n
            <div class="prev-next-btn"><button class = "prev" onclick="prevNext(${(
               ()=>{if(index===0){
                    return a.tableData.length-1;
                }else{
                    return index-1;
                }}
            )()})">Prev</button><span class="index">${a.tableData.indexOf(a.tableData[index])}/${a.tableData.length-1}</span>
            <button class="next" onclick="prevNext(${
               (()=>{if(index===a.tableData.length-1){
                    return 0;
                }else{
                    return index+1;
                }})()
            })">Next</button></div>
            `;
    }
}

let timerforAllData = setInterval(() => {
    let dataTypeOf = typeof(a.allData);
    if (dataTypeOf === "object") {
        let searchData = a.allData;
        let form = document.querySelector(".search");
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let dataToSearch = form[0].value;
            let dataToFilter = a.allData[0].data;
            let flter = dataToFilter.filter((data, index) => {
                let rx = new RegExp(dataToSearch, 'gi')
                return data.city.match(rx) || data.country.match(rx)
            })

            let all = flter.map((data) => {
                let pcountMap = data.populationCounts.map((cur1, j) => {
                    return (
                        `<table>
                    <thead>
                    <tr>
                    <th>Year</th>
                    <th>Value</th>
                    <th>Sex</th>
                    <th>Reliabilty</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td>${cur1.year}</td>
                    <td>${cur1.value}</td>
                    <td>${cur1.sex}</td>
                    <td>${cur1.reliabilty}</td>
                    </tr>
                    </tbody>
                    
                    </table>
                    `
                    )
                })
                return (
                    `<h3>${flter.length} Results found for ${dataToSearch}</h3>
                        <table>
                            <thead>
                            <tr>
                            <th>City</th>
                            <th>Country</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                            <td>${data.city}</td>
                            <td>${data.country}</td>
                            </tr>
                            </tbody>
                            </table>
                            ${pcountMap.join("")}
                            `
                )
            }, "\r")
            a.tableData = all;
            displayDataInPage();

        });
        clearInterval(timerforAllData)
    }
}, 0)