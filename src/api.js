/*
 * xhr.status ---> fail
 * response.code === 1 ---> success
 * response.code !== 1 ---> error
 * */

/**
 * get danmaku type.
 * 1从右至左滚动弹幕|6从左至右滚动弹幕|5顶端固定弹幕|4底端固定弹幕|7高级弹幕|8脚本弹幕
 * @type {{1: string, 6: string, 5: string, 4: string}}
 */
const typeArr = {
    '1':'right', '6':'left', '5': 'top', '4': 'bottom'
};

/**
 * load xml format danmaku
 * @param fromSrc
 * @returns {{code: number, danmaku: Array}}
 * @constructor
 */
const LoadXML = function(fromSrc){
    let xmlDoc = null;
    if (window.DOMParser)
    {
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(fromSrc, "text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(fromSrc);
    }
    let docs = xmlDoc.getElementsByTagName('d');
    let danmakuData = {"code":1, "danmaku":[]};
    for(let i=0; i<docs.length; i++){
        let p_data = docs[i].getAttribute('p').split(',');
        // 2.669,1,25,16777215,1487388190,54,0,d8a50e2fbfea29c7d530388ec6113ae6
        // {"_id":"581ac16d19da4d000ed43dae",
        // "author":"DIYgod",
        // "time":7.729345,
        // "text":"てすと",
        // "color":"#fff",
        // "type":"right",
        // "__v":0,
        // "player":["9E2E3368B56CDBB42"]}
        danmakuData.danmaku.push({
            _id: p_data[7],
            author: 'Pajiji',
            time: parseFloat(p_data[0]),
            text: docs[i].innerHTML,
            color: '#' + (parseInt(p_data[3], 10)).toString(16),
            type: typeArr[p_data[1]],
            size: parseInt(p_data[2], 10)
        });
    }
    return danmakuData;
};

/**
 * request server response
 * @param url
 * @param data
 * @param success
 * @param error
 * @param fail
 * @constructor
 */
const SendXMLHttpRequest = (url, data, success, error, fail) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                let response_pre = null;
                if(xhr.response.indexOf('<?xml') === 0){
                    response_pre = LoadXML(xhr.responseText);
                }
                else{
                    response_pre = JSON.parse(xhr.responseText);
                }
                const response = response_pre;
                if (xhr.responseText == '' || xhr.responseText == 'None' || response.code !== 1) {
                    return error(xhr, response)
                }

                return success(xhr, response)
            }

            fail(xhr)
        }
    };

    xhr.open((data !== null) ? 'POST' : 'GET', url, true)
    xhr.send((data !== null) ? JSON.stringify(data) : null)
};

/**
 * post danmaku to server
 * @param endpoint
 * @param danmakuData
 */
export const send = (endpoint, danmakuData) => {
    SendXMLHttpRequest(endpoint, danmakuData, (xhr, response) => {
        console.log('Post danmaku: ', response)
    }, (xhr, response) => {
        alert(response.msg)
    }, (xhr) => {
        console.log('Request was unsuccessful: ' + xhr.status)
    })
};

/**
 * read response
 * @param endpoint
 * @param cbk
 */
export const read = (endpoint, cbk) => {
    SendXMLHttpRequest(endpoint, null, (xhr, response) => {
        cbk(null, response.danmaku)
    }, (xhr, response) => {
        cbk({ status: xhr.status, response })
    }, (xhr) => {
        cbk({ status: xhr.status, response: null })
    })
};