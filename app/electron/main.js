import { app, BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'
const isDev=!!process.env.VITE_DEV
function create(){const win=new BrowserWindow({width:1200,height:800,webPreferences:{nodeIntegration:false,contextIsolation:true}});if(isDev){win.loadURL('http://localhost:5173');win.webContents.openDevTools({mode:'detach'})}else{const p=url.pathToFileURL(path.join(process.cwd(),'dist','index.html')).toString();win.loadURL(p)}}
app.whenReady().then(()=>{create();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create()})})
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()})
