var request = require('request');
const generateAuthToken = () => {

    return new Promise((resolve,reject) => {
        var options = {
        'method': 'POST',
        'url': 'https://pix-h.aarin.com.br/api/v1/oauth/token',
        'headers': {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "empresaId":"126aec53-abf9-4765-86b0-9cb989a7507b",
            "senha":"9qj4rvax33xcrgk5fpwwfb8tbkazuz2z",
            "escopo":[
                "cob.write",
                "cob.read",
                "pix.write",
                "pix.read",
                "webhook.write",
                "webhook.read",
                "account.read"
            ]
        })
        };
        request(options, function (error, response) {
        if (error){
            reject(error);
        } else {
            resolve(JSON.parse(response.body));
        }
        });

    });

}

exports.createCharge = async (req,res) => {

    try {

        console.log('req.body',req.body)

        var errors = [];
        req.checkBody('nome', res.__('Name is Required')).notEmpty();
        req.checkBody('cpf', res.__('CPF is Required')).notEmpty();
        req.checkBody('cnpj', res.__('CNPJ is Required')).notEmpty();
        req.checkBody('valor', res.__('valor  is Required')).notEmpty();
        errors = req.validationErrors();
        
        if (errors) {
            res.send({
            "status": "0",
            "errors": errors[0].msg
            });
            return;
        }
        
        const token = await generateAuthToken();
        console.log('token response',token.accessToken)

        var options = {
            'method': 'POST',
            'url': 'https://pix-h.aarin.com.br/api/v1/cob',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`,
                'Cookie': '__cfduid=d6cdc975f4609ebfd9743890458b0c89d1618311704'
            },
            body: JSON.stringify({
                "calendario":{
                    "expiracao":7200
                },
                "devedor":{
                    "nome":req.body.nome,
                    "cpf":req.body.cpf,
                    "cnpj":req.body.cnpj
                },
                "valor":{
                    "original":parseFloat(req.body.valor).toFixed(2)
                },
                "chave":"40a0932d-1918-4efe-846d-35a2da1690df",
                "solicitacaoPagador":"Informar cartão de desconto",
            })
        };
        request(options, function (error, response) {
            if (error){
                res.send({
                    status : 0,
                    message : error.message
                });
            } else {
                res.send({
                    status : 1,
                    message : JSON.parse(response.body)
                });
            }
        });
        
    } catch (error) {
        console.log('Error',error);
        res.send({
            status : 0,
            message : error.message
        });
    }

}

exports.createNotificationCharge = async (req,res) => {

    try {

        var errors = [];
        req.checkBody('pagador', res.__('pagador is Required')).notEmpty();
        req.checkBody('valor', res.__('valor  is Required')).notEmpty();
        errors = req.validationErrors();
        
        if (errors) {
            res.send({
            "status": "0",
            "errors": errors[0].msg
            });
            return;
        }
        
        const token = await generateAuthToken();
        console.log('token response',token.accessToken)

        var options = {
            'method': 'POST',
            'url': 'https://notification-sender-h.aarin.com.br/Notification',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`,
                'Cookie': '__cfduid=d6cdc975f4609ebfd9743890458b0c89d1618311704'
            },
            body: JSON.stringify({
                "idExternoCobranca":"MOCK_5c35197e-0c45-4003-ba85-c2f2e2f584fc",
                "valor":parseFloat(req.body.valor).toFixed(2),
                "recebedor":{
                    "nome":"Empresa de Tecnologia S.A",
                    "ispb":"12345678",
                    "agencia":"0001",
                    "conta":"00000003446",
                    "nrCpfCnpj":"12312312312",
                    "tpPessoa":"NATURAL_PERSON"
                },
                "pagador":JSON.parse(req.body.pagador),
                "tpTransacao": "CRD"
            })
        };
        request(options, function (error, response) {

            console.log('body',options.body)

            if (error){
                res.send({
                    status : 0,
                    message : error.message
                });
            } else {
                res.send({
                    status : 1,
                    message : JSON.parse(response.body)
                });
            }
        });
        
    } catch (error) {
        console.log('Error',error);
        res.send({
            status : 0,
            message : error.message
        });
    }

}


exports.checkBalance = async (req,res) => {

    try {

        const token = await generateAuthToken();
        console.log('token response',token.accessToken)

        var options = {
            'method': 'GET',
            'url': 'https://pix-h.aarin.com.br/api/v1/contas-bancarias',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`,
                'Cookie': '__cfduid=d6cdc975f4609ebfd9743890458b0c89d1618311704'
            },
        };
        request(options, function (error, response) {
            if (error){
                res.send({
                    status : 0,
                    message : error.message
                });
            } else {
                res.send({
                    status : 1,
                    message : JSON.parse(response.body)
                });
            }
        });
        
    } catch (error) {
        console.log('Error',error);
        res.send({
            status : 0,
            message : error.message
        });
    }

}