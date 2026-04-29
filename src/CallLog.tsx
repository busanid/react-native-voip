type callLog = {
    status: string,
    direction: string,
    fromAddress: string,
    toAddress: string,
    subLog: Array<callLog>
}

export default class CallLog {
    static formatLinphone(callLogs: any) {
        let result = [];
        let prevLog: callLog = {
            status: "",
            direction: "",
            fromAddress: "",
            toAddress: "",
            subLog: []
        };
        for (let log of callLogs) {
            let isSame = false;
            if ((prevLog.status === log.status || (prevLog.status !== 'Success' && log.status !== 'Success')) && prevLog.direction == log.direction) {
                if (log.direction == 'Incoming') {
                    if (prevLog.fromAddress == log.fromAddress) {
                        isSame = true;
                    }
                }
                if (log.direction == 'Outgoing') {
                    if (prevLog.toAddress == log.toAddress) {
                        isSame = true
                    }
                }
            }

            if (!isSame) {
                prevLog = log;
                prevLog.subLog = [];
                result.push(log);
            } else {
                result[result.length - 1].subLog.push(log);
            }
        }
        return result;
    }
}