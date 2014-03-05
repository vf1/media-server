
import shutil, os
import tarfile
import zipfile
import json
import urllib

def concat(dst, src1, src2):
    destination = open(dst, 'wb')
    shutil.copyfileobj(open(src1, 'rb'), destination)
    shutil.copyfileobj(open(src2, 'rb'), destination)
    destination.close()

print ''
print '>>> Build node-webkit'

############################################################

print '  - Load package.json'
package = json.load(file("package.json"))
version = package['version']

############################################################

root_dir = "nw"

if not os.path.exists(root_dir):
    os.makedirs(root_dir)

############################################################

root_win32 = os.path.join(root_dir, "win32")
root_lin32 = os.path.join(root_dir, "lin32")
root_lin64 = os.path.join(root_dir, "lin64")

base_name = 'open-media-server'
exe_name = 'media-server'

tarname_x32 = os.path.join(root_dir, base_name + '-' + version + "-ia32.tar.gz")
tarname_x64 = os.path.join(root_dir, base_name + '-' + version + "-x64.tar.gz")
winzip_x32  = os.path.join(root_dir, base_name + '-' + version + "-x86")
nw_name     = os.path.join(root_dir, base_name + '-' + version + ".nw")

############################################################
print '  - Remove old files'

if os.path.exists(root_win32):
    shutil.rmtree(root_win32)
if os.path.exists(root_lin32):
    shutil.rmtree(root_lin32)
if os.path.exists(root_lin64):
    shutil.rmtree(root_lin64)


if os.path.exists(nw_name):
    os.remove(nw_name)
if os.path.exists(winzip_x32):
    os.remove(winzip_x32)
if os.path.exists(tarname_x32):
    os.remove(tarname_x32)
if os.path.exists(tarname_x64):
    os.remove(tarname_x64)


############################################################
print '  - Load node-webkit packages'

nw_version  = "0.9.2"
nw_link     = "https://s3.amazonaws.com/node-webkit/v" + nw_version + "/"
nw_lin_ia32 = "node-webkit-v" + nw_version + "-linux-ia32.tar.gz"
nw_lin_x64  = "node-webkit-v" + nw_version + "-linux-x64.tar.gz"
nw_osx_ia32 = "node-webkit-v" + nw_version + "-osx-ia32.zip"
nw_win_ia32 = "node-webkit-v" + nw_version + "-win-ia32.zip"

dowdload_dir = os.path.join(root_dir, "download")

if not os.path.exists(dowdload_dir):
    os.makedirs(dowdload_dir)

def download(name):
    download_file = os.path.join(dowdload_dir, name)
    if not os.path.exists(download_file):
        print '    - Download: ' + name
        urllib.urlretrieve(nw_link + name, download_file)

download(nw_lin_ia32)
download(nw_lin_x64)
download(nw_osx_ia32)
download(nw_win_ia32)


############################################################
print '  - Unpack node-webkit'

unpack_dir = os.path.join(root_dir, "unpacked")

if not os.path.exists(unpack_dir):
    os.makedirs(unpack_dir)

def splitext(path):
    for ext in ['.tar.gz', '.tar.bz2']:
        if path.endswith(ext):
            return path[:-len(ext)], path[-len(ext):]
    return os.path.splitext(path)

def unpack(name):
    download_file = os.path.join(dowdload_dir, name)
    dest_dir, arch_ext = splitext(os.path.join(unpack_dir, name))
    globals()['path-' + name] = dest_dir;
    if not os.path.exists(dest_dir):
        if arch_ext == ".tar.gz":
            print '    - Unpack: ' + name
            tarf = tarfile.open(download_file, "r:gz")
            tarf.extractall(unpack_dir)
            tarf.close()
        if arch_ext == ".zip":
            print '    - Unpack: ' + name
            zipf = zipfile.ZipFile(download_file, "r")
            zipf.extractall(dest_dir)
            zipf.close()
            

unpack(nw_lin_ia32)
unpack(nw_lin_x64)
unpack(nw_osx_ia32)
unpack(nw_win_ia32)
        
############################################################
print '  - Copy files to /build'

build_dir = os.path.join(root_dir, 'build')

def onerror(func, path, exc_info):
    import stat
    if not os.access(path, os.W_OK):
        # Is the error an access error ?
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise
        
if os.path.exists(build_dir):
    shutil.rmtree(build_dir, onerror=onerror)
os.makedirs(build_dir)

shutil.copyfile("package.json", os.path.join(build_dir, "package.json"))
shutil.copyfile("server.js", os.path.join(build_dir, "server.js"))
shutil.copytree("src", os.path.join(build_dir, "src"))
shutil.copytree("public", os.path.join(build_dir, "public"))
print '    - Copy node_modules'
shutil.copytree("node_modules", os.path.join(build_dir, "node_modules"))

import fileinput
import sys

def replaceAll(file, searchExp, replaceExp):
    for line in fileinput.input(file, inplace=1):
        if searchExp in line:
            line = line.replace(searchExp, replaceExp)
        sys.stdout.write(line)

print '    - Fix node-webkit.js file'
replaceAll(os.path.join(build_dir, "src", "node-webkit.js"), "= false;", "= true;")

############################################################
print '  - Create .nw file'

zip_file = os.path.join(root_dir, base_name + '.zip')

shutil.make_archive(os.path.join(root_dir, base_name), format="zip", root_dir=build_dir)
shutil.move(zip_file, nw_name)


############################################################
print '  - Build Windows x32'
shutil.copytree(globals()['path-' + nw_win_ia32], root_win32)
concat(root_win32 + "/" + exe_name + ".exe", root_win32 + "/nw.exe", nw_name)
os.remove(root_win32 + "/nw.exe")
os.remove(root_win32 + "/nwsnapshot.exe")
os.remove(root_win32 + "/credits.html")
shutil.make_archive(winzip_x32, format="zip", root_dir=root_win32)


############################################################
def tarLinuxFiles(tarname, src):
    tar = tarfile.open(tarname, "w:gz")
    for name in ["libffmpegsumo.so", exe_name, "nw.pak"]:
        tar.add(src + "/" + name, arcname=name)
    tar.close()

def buildLinux(nw_source, root_lin, tarname):
    shutil.copytree(nw_source, root_lin)
    concat(root_lin + "/" + exe_name, root_lin + "/nw", nw_name)
    os.remove(root_lin + "/nw")
    os.remove(root_lin + "/nwsnapshot")
    os.remove(root_lin + "/credits.html")
    tarLinuxFiles(tarname, root_lin)


print '  - Build Linux x32'
buildLinux(globals()['path-' + nw_lin_ia32], root_lin32, tarname_x32);

print '  - Build Linux x64'
buildLinux(globals()['path-' + nw_lin_x64], root_lin64, tarname_x64);


############################################################
print '>>> done'


