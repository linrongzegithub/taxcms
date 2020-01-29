'use strict';
const Core = require('@alicloud/pop-core');
const Controller = require('egg').Controller;

class UserController extends Controller {
    async code() {
        let that = this;
        let code = Math.random().toString().slice(-6);
        await this.app.redis.set("phone_code",code);
        
        let { phone } = this.ctx.query;
        let client = new Core({
            accessKeyId: 'LTAI4FnT1q6ZHvd7SXB1MtgF',
            accessKeySecret: 'wNxsBibCVEeoaO9Ff2YHZ7X94nHYkH',
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });
        let params = {
            "RegionId": "cn-hangzhou",
            "PhoneNumbers": phone,
            "SignName": "荣屿财税",
            "TemplateCode": "SMS_182870703",
            "TemplateParam": `{\"code\":\"${code}\"}`
        }
    
        let requestOption = {
            method: 'POST'
        };
        client.request('SendSms', params, requestOption).then((result) => {
            if(result.Code == 'Ok') {
                that.ctx.body = {
                    code:200,
                    msg:"发送验证码成功",
                    data:null
                }
            }
        }, (ex) => {
            that.ctx.body = {
                code:400,
                msg:"发道验证码失败",
                data:null
            }
        })
        
    }
    //增加用户
    async add() {
        let result = this.ctx.request.body;
        let phone = result.phone;
        let phone_code = await this.app.redis.get("phone_code");
        if(result.phone_code == phone_code) {
            let data = await this.ctx.model.User.find({"phone":phone});
            if(data.length > 0) {
                this.ctx.body = {
                    code:404,
                    msg:"手机号以被注册过",
                    data:null
                }
            } else {
                let res = new this.ctx.model.User(result);
                await res.save();
                this.ctx.body = {
                    code:200,
                    msg:"注册成功",
                    data:null
                }
            }
        } else {
            this.ctx.body = {
                code:404,
                msg:"验证码错误",
                data:null
            }
        }
    }

}

module.exports = UserController;