const AV = require('leancloud-storage');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');

require('dotenv').config();

AV.init({
  appId: process.env.APP_ID,
  appKey: process.env.APP_KEY
});

const dataPath = path.resolve(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) {
  console.error('data.json is missing!');
  return;
}

const content = JSON.parse(fs.readFileSync(dataPath).toString());
if (!content || !content.comments) {
  console.error('no comments found!');
  return;
}

const Comment = AV.Object.extend('Comment');
const imported = {};

const comments = _.sortBy(content.comments, ['ctime', 'id']);

async function importData () {
  for (const comment of comments) {
    const url = new URL(comment.topicUrl);
    if (url.hostname.endsWith('.local')) {
      continue;
    }

    let nick = comment.nickname;
    if (!nick || nick === '有课') {
      nick = `佚名`;

      if (comment.ip && process.env.ALI_IP_APP_CODE) {
        try {
          const resp = await axios.get(`http://ipquery.market.alicloudapi.com/query?ip=${comment.ip}`, {
            headers: {
              Authorization: `APPCODE ${process.env.ALI_IP_APP_CODE}`
            }
          })
          if (resp.data && resp.data.ret === 200) {
            let location = resp.data.data.prov
            if (location !== resp.data.data.city) {
              location += resp.data.data.city
            }
            nick = `${location} 网友`;
          }
        } catch (e) {
          console.log(e)
        }
      }

      if (nick === 'ψ(╰_╯)' || nick === '如花隔云端') {
        nick = '图标工场';
      }
    }

    if (!comment.mail && nick === '图标工场') {
      comment.mail = 'ceo@wuruihong.com';
      comment.userProfileUrl = 'https://icon.wuruihong.com';
    }

    let content = comment.content || '';

    let mail = comment.mail || '';
    if (!mail && comment.ip) {
      mail = `${comment.ip}@unknown.com`;
    }

    const parent = imported[comment.replyId]

    const data = {
      nick,
      ip: comment.ip,
      mail,
      ua: comment.ua || comment.userAgent || '',
      insertedAt: new Date(comment.ctime),
      pid: parent ? parent.id : '',
      link: comment.userProfileUrl || '',
      comment: content.replace(/\n/g, '<br/>'),
      url: url.pathname,
      rid: parent ? parent.id : '',
    }
    // console.log(data);

    const co = new Comment();
    const o = await co.save(data);
    imported[comment.id] = o;
    console.log(`${comment.id} imported to ${o.id}.`)
  }
}

importData().then(() => {
  console.log('Done!');
});
