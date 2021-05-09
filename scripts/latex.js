const shell = require('shelljs');
const fs = require('fs')
//const sharp = require('sharp');
s = ""
module.exports.compile = async (id, solving,output_scale = '1.0') => {
    latexsolv = getpreambule() + solving + "$\\end{document}"
    var dir = `/home/queuebot/api.queuebot.me/temp/${id}`;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.writeFile(`/home/queuebot/api.queuebot.me/temp/${id}/solving.tex`, latexsolv, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
    await execAsync(`cd /home/queuebot/api.queuebot.me/temp/${id}
    latex solving.tex
    dvipng solving.dvi -D 600`);

    //await sharp(`temp/${id}/solution.svg`, {density: 300})
    //    .toFile(`temp/${id}/solution.png`);
    return `temp/${id}/solving1.png`
};

function getpreambule(){
    s = `\\documentclass{article}\n\\usepackage[a6paper]{geometry}\n\\usepackage{lmodern}\n\\usepackage{textcomp}\n\\usepackage{lastpage}\n\\usepackage{amsmath}\n\\usepackage{amsfonts}`
    s += `\n\\usepackage{amssymb}\n\\usepackage[T2A,T1]{fontenc}\n\\usepackage[utf8]{inputenc}\n\\usepackage[english,russian,ukrainian]{babel}\n\\pagenumbering{gobble}\n\\begin{document}$`
    return s;
}

function execAsync(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        shell.exec(cmd, opts, (code, stdout, stderr) => {
            if (code !== 0) reject(new Error(stderr));
            else resolve(stdout);
        });
    });
}
