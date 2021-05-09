const shell = require('shelljs');
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
    s = `\\documentclass{article}
\usepackage[a6paper]{geometry}
\usepackage{lmodern}
\usepackage{textcomp}
\usepackage{lastpage}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage[T2A,T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage[english,russian,ukrainian]{babel}
\\pagenumbering{gobble}
\\begin{document}
$`
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
