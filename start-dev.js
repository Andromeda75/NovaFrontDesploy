const { spawn } = require('child_process');
const path = require('path');

console.log('\n Iniciando NovaCreations...\n');

// Iniciar backend
console.log('Iniciando servidor backend...');
const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

setTimeout(() => {
    console.log('\n Iniciando frontend React...\n');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    // Manejar cierre
    process.on('SIGINT', () => {
        console.log('\n Cerrando servidores...');
        backend.kill();
        frontend.kill();
        process.exit();
    });
}, 3000);