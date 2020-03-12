import * as ejs from 'ejs';

let p = ['geddy', 'neil', 'alex'];
const target = ejs.render('<%= p.join(","); %>', { p });

console.log(target);
