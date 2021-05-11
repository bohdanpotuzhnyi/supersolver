const shell = require('shelljs');
const fs = require('fs')

module.exports.compile = async (id) => {
    await execAsync(`cd /home/queuebot/api.queuebot.me/temp/${id}
    latex solving.tex
    dvipng solving.dvi -D 600`);
};

module.exports.writetex = async (id, solving) => {
    latexsolv = `
        ${preambule}
        \\begin{document}
        \$${solving}\$
        \\end{document}
    `;
    //var dir = `/home/queuebot/api.queuebot.me/temp/${id}`;

    await fs.writeFile(`/home/queuebot/api.queuebot.me/temp/${id}/solving.tex`, latexsolv, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

module.exports.wts = async (id, solving) => {
    latexsolv = `
        ${preambule}
        \\begin{document}
        \$${solving}`;
    //var dir = `/home/queuebot/api.queuebot.me/temp/${id}`;

    await fs.writeFile(`/home/queuebot/api.queuebot.me/temp/${id}/solving.tex`, latexsolv, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
}

const preambule = `
    \\documentclass{article}
    \\usepackage[T2A,T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage[english,russian,ukrainian]{babel}
    \\usepackage[a6paper]{geometry}
    \\usepackage{lmodern}
    \\usepackage{textcomp}
    \\usepackage{lastpage}
    \\usepackage{amsmath}
    \\usepackage{amsfonts}
    \\usepackage{amssymb}
    \\pagenumbering{gobble}
`;

function execAsync(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        shell.exec(cmd, opts, (code, stdout, stderr) => {
            if (code !== 0) reject(new Error(stderr));
            else resolve(stdout);
        });
    });
}
