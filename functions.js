const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('./vt.js');
const crypto = require('crypto');

function getClientIp(req) {
    // 'x-forwarded-for' başlığı genellikle proxy tarafından ayarlanır ve birden fazla IP adresi içerebilir.
    // Bu nedenle, ilk gelen IP adresi genellikle gerçek istemci IP adresidir.
    const forwardedIps = req.headers['x-forwarded-for'];
    if (forwardedIps) {
        const ipArray = forwardedIps.split(',');
        return ipArray[0]; // İlk IP adresini döndür
    }

    // Eğer 'x-forwarded-for' başlığı yoksa, doğrudan bağlantıdan gelen IP'yi kullan
    return req.socket.remoteAddress;
}

function parseXMLContent(data, tag) {
  const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'gs');
  const matches = [];
  let match;
  while (match = regex.exec(data)) {
    matches.push(match[1]);
  }
  return matches;
}

const functions = {
    getCode: async function(req, res) {
        const codeModule = require('./code.js');
        codeModule.getCode((err, code) => {
            if (err) {
                //console.error('Bir hata oluştu:', err);
                return;
            }
            //console.log(code); // Çıktı olarak güncellenmiş C++ kodu
            res.send(code);
        });
    },
    getValues: async function(req, res) {
        fs.readFile(path.join(__dirname, 'data', 'values.json'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Dosya okunamadı.');
                return;
            }
            res.json(JSON.parse(data));
        });
    },
    setValues: async function(req, res) {
        // Dosyanın tam yolu
        const filePath = path.join(__dirname, 'data', 'values.json');
        
        // Statik değerler
        const staticValues = {
            iterasyon: "50",
            mu: "1,2",
            vanderPolInitVal1: "2",
            vanderPolInitVal2: "1"
        };
        
        // values.json dosyasını oku
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                res.status(500).send('Dosya okuma sırasında bir hata oluştu.');
                return;
            }
            try {
                // Mevcut değerleri JSON olarak parse et
                const values = JSON.parse(data);
    
                // Gelen değerlerle mevcut değerleri güncelle
                for (let key in req.body) {
                    if (values.hasOwnProperty(key) && key !== 'action') {
                        // Formdan gelen değer boş ise statik değeri kullan
                        if(req.body[key].trim() === "") {
                            values[key] = staticValues[key];
                        } else {
                            values[key] = req.body[key];
                        }
                    }
                }
    
                // Güncellenmiş değerleri dosyaya yaz
                fs.writeFile(filePath, JSON.stringify(values, null, 2), async (err) => {
                    if (err) {
                        res.status(500).send('Dosya yazma sırasında bir hata oluştu.');
                        return;
                    }
                    await this.setCodeCpp();
                    res.send({ success: "Değerler başarıyla güncellendi." });
                });
            } catch (err) {
                res.status(500).send('JSON parsing sırasında bir hata oluştu.');
            }
        });
    },
    setCodeCpp: async function() {
        const codeModule = require('./code.js');
        codeModule.getCode((err, code) => {
            if (err) {
                console.error('Bir hata oluştu:', err);
                res.status(500).send('C++ kodu alınırken bir hata oluştu.');
                return;
            }
    
            // C++ kodunu 'main.cpp' dosyasına yaz
            const filePath = path.join(__dirname, 'data', 'main.cpp');
            fs.writeFile(filePath, code, 'utf8', (err) => {
                if (err) {
                    console.error('Dosyaya yazılırken bir hata oluştu:', err);
                    return;
                }
                console.error('C++ kodu başarıyla güncellendi.');
            });
        });
    },
    getCppOutput: async function(req, res) {
        const compileAndRunCommand = path.join(__dirname, 'compile_and_run.sh');
    
        exec(compileAndRunCommand, { timeout: 5000 }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Hata oluştu: ${error}`);
                res.status(500).json({ error: 'Dosya çalıştırma hatası', message: stderr });
                return;
            }
            try {
                await this.outputJson(); //output.json dosyasını oluştur
                res.send({ output: "success" });
            } catch (err) {
                res.status(500).send('Çıktı dosyası okunamadı.');
            }
        });
    },
    getOutputContent: async function(req, res) {
        const filePath = path.join(__dirname, 'data', 'output.txt');
        fs.readFile(filePath, 'utf8', async (err, data) => {
          if (err) {
            console.error(`Dosya okuma hatası: ${err}`);
            res.status(500).send('Dosya okunamadı');
            return;
          }
          const safeData = data;
          const htmlData = safeData.replace(/\n/g, '<br>'); // Yeni satırları <br> ile değiştir
          res.header("Content-Type", "text/html");
          res.send(htmlData);
          
        });
    },
    getUser: async function(req, res) {
        const origin = req.headers.origin;
        const userIp = getClientIp(req);
        const userAgent = req.get('User-Agent');
        console.log('User IP:', userIp);
        console.log('User Agent:', userAgent);
        console.log('User origin:', userAgent);
        const users = {
            Url:origin,
            Ip:userIp,
            UserAgent:userAgent
        }
        try {
            const insertId = await db.insert("log", users);
            //console.log('Insert ID:', insertId);
        } catch (error) {
            console.error('Insert error:', error);
        }
        res.send("success");
    },
    outputJson: async function() {
        try {
            const jsonContent = fs.readFileSync(path.join(__dirname, '/data/values.json'), 'utf8');
            const jsonValues = JSON.parse(jsonContent);
            const { mu, vanderPolInitVal1, vanderPolInitVal2, iterasyon } = jsonValues;
            const checkkey = crypto.createHash('sha256').update(`${mu}${vanderPolInitVal1}${vanderPolInitVal2}`).digest('hex');
            
            const programOutput = fs.readFileSync(path.join(__dirname, '/data/output.txt'), 'utf8');
    
            const ode = parseXMLContent(programOutput, 'ode')[0];
            const mapStacking = parseXMLContent(programOutput, 'mapStacking')[0];
            const initialVector = parseXMLContent(programOutput, 'initialVector')[0];
            const constructF = parseXMLContent(programOutput, 'constructF')[0];
            const iterationTitle = parseXMLContent(programOutput, 'iterationTitle')[0].replace(/<.*?>/g, '');
            const iterationTitleTotal = parseXMLContent(programOutput, 'iterationTitleTotal')[0];
    
            const odeData = {
                token: checkkey,
                iterasyon,
                mu,
                baslangic1:vanderPolInitVal1,
                baslangic2:vanderPolInitVal2,
                ode,
                mapStacking,
                initialVector,
                constructF,
                iterationTitle
            };
            //rho
            let rhoData = [];
            const rhoItems = parseXMLContent(programOutput, 'rhoItem');
            rhoItems.forEach(async item => {
                const rhoString = item.match(/rho\[\d+\]/)[0];
                const rhoStep = parseInt(/rho\[(\d+)\]/.exec(rhoString)[1]);
                const rhoVals = Array.from(item.matchAll(/<rhoVal>(.*?)<\/rhoVal>/g), m => m[1]);
                const token_rho = crypto.createHash('sha256').update(`${checkkey}${rhoStep}`).digest('hex');
                const rho_data = {
                    token:token_rho,
                    rho: rhoString,
                    rhoStep,
                    rhoVal: JSON.stringify(rhoVals)
                };
                rhoData.push(rho_data);
            });
            //rho
            //iterasyon
            let iterasyonData = [];
            const rows = parseXMLContent(programOutput, 'row');
            rows.forEach(async row => {
                const iterationInfo = parseXMLContent(row, 'iterationInfo')[0];
                const iterationCountMatch = iterationInfo.match(/<iterationCount>(\d+)<\/iterationCount>/);
                const iterationTMatch = iterationInfo.match(/<iterationT>(t=[^<]+)<\/iterationT>/);
            
                const iterationCount = iterationCountMatch ? iterationCountMatch[1] : undefined;
                const iterationT = iterationTMatch ? iterationTMatch[1].trim() : undefined;
                const token = crypto.createHash('sha256').update(`${checkkey}${iterationCount}${iterationT}`).digest('hex');
            
                const itemVals = parseXMLContent(row, 'itemVal');
                const rowData = {
                    token,
                    iterationInfo: iterationInfo.replace(/<.*?>/g, ''),
                    iterationCount,
                    iterationT,
                    iterationVal: JSON.stringify(itemVals)
                };
                iterasyonData.push(rowData);
            });
            //iterasyon
            const output_data = {
                ode: odeData,
                rho:rhoData,
                iterasyon:iterasyonData
            }
            const filePath = path.join(__dirname, 'data', 'output.json');
            const output_string = `${JSON.stringify(output_data)}`;
            fs.writeFile(filePath, output_string, 'utf8', async (err) => {
                if (err) {
                    console.error('Dosyaya yazılırken bir hata oluştu:', err);
                    return;
                }
                await this.saveJson();
                console.log('output_data created.');
            });
        } catch (error) {
            console.error('Error processing and saving data:', error);
        }
    },
    saveJson: async function(){
        try {
            const filePath = path.join(__dirname, 'data', 'output.json');
            const data = fs.readFileSync(filePath, 'utf8');
            const { ode, rho, iterasyon } = JSON.parse(data);
    
            // Check if ode record exists
            const existingOde = await db.query('SELECT Id, iterasyon FROM ode WHERE token = ?', [ode.token]);
            let odeId;
    
            if (existingOde.length === 0) {
                // Insert new ode record
                odeId = await db.insert('ode', ode);
                if (!odeId) {
                    throw new Error('Failed to insert new ode record');
                }
            } else {
                // Use existing ode record
                odeId = existingOde[0].Id;
                if (parseInt(ode.iterasyon, 10) > parseInt(existingOde[0].iterasyon, 10)) {
                    await db.update('ode', 'Id', odeId, { iterasyon: ode.iterasyon, iterationTitle: ode.iterationTitle});
                }
            }
    
            // Handle rho records
            for (const rhoRecord of rho) {
                const existingRho = await db.query('SELECT Id FROM rho WHERE token = ?', [rhoRecord.token]);
                if (existingRho.length === 0) {
                    await db.insert('rho', { ...rhoRecord, odeId });
                }
            }
    
            // Handle iterasyon records
            for (const iterasyonRecord of iterasyon) {
                const existingIterasyon = await db.query('SELECT Id FROM iteration WHERE token = ?', [iterasyonRecord.token]);
                if (existingIterasyon.length === 0) {
                    await db.insert('iteration', { ...iterasyonRecord, odeId });
                }
            }
    
            //console.log('Save data from json success:');
        } catch (error) {
            console.error('Error in saveDataFromJson:', error);
            
        }
    },
    oleFromDataTable: async function(req, res) {
        try {
            const start = parseInt(req.body.start) || 0;
            const length = parseInt(req.body.length) || 10;
            const searchValue = req.body.search.value || '';
            const order = req.body.order[0];
            const columnName = req.body.columns[order.column].data;
            const columnSortOrder = order.dir;
    
            let whereClause = '';
            if (searchValue) {
                whereClause = `WHERE iterasyon LIKE '%${searchValue}%' OR mu LIKE '%${searchValue}%' 
                               OR baslangic1 LIKE '%${searchValue}%' OR baslangic2 LIKE '%${searchValue}%' 
                               OR mapStacking LIKE '%${searchValue}%' OR initialVector LIKE '%${searchValue}%' 
                               OR iterationTitle LIKE '%${searchValue}%' OR ode LIKE '%${searchValue}%'`;
            }
    
            const totalRecords = await db.query(`SELECT COUNT(*) as count FROM ode ${whereClause}`);
            const totalFiltered = totalRecords[0].count;
    
            const query = `SELECT * FROM ode ${whereClause} ORDER BY ${columnName} ${columnSortOrder} LIMIT ${start}, ${length}`;
            const veriler = await db.query(query);
            //console.log("data_table query:",query, start, length, veriler);
            const response = {
                draw: parseInt(req.body.draw),
                recordsTotal: totalFiltered,
                recordsFiltered: totalFiltered,
                data: veriler.map(row => ({
                    ...row,
                    islem: `<button class="btn btn-primary" onclick="db_iterasyon(${row.Id},'iterasyon=${row.iterasyon} | Mu=${row.mu} | Baslangic1=${row.baslangic1} | Baslangic2=${row.baslangic2}')">İterasyon</button>
                            <button class="btn btn-warning" onclick="db_rho(${row.Id},'iterasyon=${row.iterasyon} | Mu=${row.mu} | Baslangic1=${row.baslangic1} | Baslangic2=${row.baslangic2}')">RHO</button>`
                }))
            };
            //console.log("data_table verile geldi mi?",response);
            res.json(response);
        } catch (error) {
            console.error('Error fetching data for DataTable:', error);
            res.status(500).send('Server error');
        }
    },
    iterationFromDataTable: async function(req, res) {
        try {
            const start = parseInt(req.body.start) || 0;
            const length = parseInt(req.body.length) || 10;
            const searchValue = req.body.search.value || '';
            const order = req.body.order[0];
            const columnName = req.body.columns[order.column].data;
            const columnSortOrder = order.dir;
            const odeId = req.body.odeId;
    
            let whereClause = `WHERE odeId = '${odeId}' `;
            if (searchValue) {
                whereClause = `WHERE odeId = '${odeId}' AND iterationInfo LIKE '%${searchValue}%' OR iterationCount LIKE '%${searchValue}%' 
                               OR iterationT LIKE '%${searchValue}%' OR iterationVal LIKE '%${searchValue}%'`;
            }
    
            const totalRecords = await db.query(`SELECT COUNT(Id) as count FROM iteration ${whereClause}`);
            const totalFiltered = totalRecords[0].count;
            const query = `SELECT iterationInfo,iterationCount,iterationT,iterationVal,ZamanDamgasi FROM iteration ${whereClause} ORDER BY ${columnName} ${columnSortOrder} LIMIT ${start}, ${length}`;
            const veriler = await db.query(query);
            //console.log("data_table query:",query, start, length, veriler);
            const response = {
                draw: parseInt(req.body.draw),
                recordsTotal: totalFiltered,
                recordsFiltered: totalFiltered,
                data: veriler.map(row => ({
                    ...row
                }))
            };
            //console.log("data_table verile geldi mi?",response);
            res.json(response);
        } catch (error) {
            console.error('Error fetching data for DataTable:', error);
            res.status(500).send('Server error');
        }
    },
    rhoFromDataTable: async function(req, res) {
        try {
            const start = parseInt(req.body.start) || 0;
            const length = parseInt(req.body.length) || 10;
            const searchValue = req.body.search.value || '';
            const order = req.body.order[0];
            const columnName = req.body.columns[order.column].data;
            const columnSortOrder = order.dir;
            const odeId = req.body.odeId;
    
            let whereClause = `WHERE odeId = '${odeId}' `;
            if (searchValue) {
                whereClause = `WHERE odeId = '${odeId}' AND rhoStep LIKE '%${searchValue}%' OR rho LIKE '%${searchValue}%' 
                               OR rhoVal LIKE '%${searchValue}%'`;
            }
    
            const totalRecords = await db.query(`SELECT COUNT(Id) as count FROM rho ${whereClause}`);
            const totalFiltered = totalRecords[0].count;
    
            const query = `SELECT rhoStep,rho,rhoVal,ZamanDamgasi FROM rho ${whereClause} ORDER BY ${columnName} ${columnSortOrder} LIMIT ${start}, ${length}`;
            const veriler = await db.query(query);
            //console.log("data_table query:",query, start, length, veriler);
            const response = {
                draw: parseInt(req.body.draw),
                recordsTotal: totalFiltered,
                recordsFiltered: totalFiltered,
                data: veriler.map(row => ({
                    ...row
                }))
            };
            //console.log("data_table verile geldi mi?",response);
            res.json(response);
        } catch (error) {
            console.error('Error fetching data for DataTable:', error);
            res.status(500).send('Server error');
        }
    },
    about: async function(req, res){
        const text = `<h1 class="text-center mt-3">Proje Hakkında</h1>
<p class="text-center">Bu proje, Van der Pol osilatörünün sayısal çözümlerinin olasılıksal evrim yöntemleri kullanılarak elde edilmesi ve bu çözümlerin veritabanı sistemleri aracılığıyla yönetilmesi süreçlerini kapsamlı bir şekilde incelemektedir. Çalışmada, Dr. Öğr. Üyesi Coşar Gözükırmızı tarafından geliştirilen ve GitHub üzerinden erişilebilen "<a href='https://github.com/cosargozukirmizi/space-extension-of-explicit-ODEs/tree/main' target='_blank'>space-extension-of-explicit-ODEs</a>" projesindeki metotlar temel alınmıştır. Bu yöntemler, C++ programlama dili kullanılarak uygulanmış ve elde edilen veriler, Node.js, Web teknolojileri ve modern veritabanı teknikleri ile işlenmiştir.
Tez kapsamında geliştirilen sistem, büyük veri setlerinin etkin bir şekilde işlenip saklanabilmesi için bir çerçeve sunmakta ve Van der Pol denklemlerinin çözümlerini daha erişilebilir kılmaktadır.</p>`;
        const response = {
            text:text
        };
        res.json(response);
    },
    
    // Diğer fonksiyonlar için buradan devam.... 
};

module.exports = functions;
