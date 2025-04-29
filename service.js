var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Bazincat - Backend',
  description: 'Back end das aplicacoes Celeiro',
  script: 'C:\\Projetos\\backend-bazincat\\src\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();