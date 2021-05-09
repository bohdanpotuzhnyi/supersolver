const shell = require('shelljs');
const fs = require('fs')
//const sharp = require('sharp');
s = ""
module.exports.compile = async (id, solving,output_scale = '1.0') => {
    doc = getpreambule() + solving + "$\\end{document}"
    fs.writeFile(`/home/queuebot/api.queuebot.me/temp/${id}/solving.tex`, solving, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
    await execAsync(`cd temp/${id}
    latex solution.tex
    dvipng solution.dvi -D 300`);

    //await sharp(`temp/${id}/solution.svg`, {density: 300})
    //    .toFile(`temp/${id}/solution.png`);
};

function getpreambule(){
    s = `\\documentclass{article}\n\\usepackage[a6paper]{geometry}\n\\usepackage{lmodern}\n\\usepackage{textcomp}\n\\usepackage{lastpage}\n\\usepackage{amsmath}\n\\usepackage{amsfonts}`
    s += `\\usepackage{amssymb}\n\\usepackage[T2A,T1]{fontenc}\n\\usepackage[utf8]{inputenc}\n\\usepackage[english,russian,ukrainian]{babel}\n\\pagenumbering{gobble}\n\\begin{document}$`
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
