# Author: Alberto González Palomo https://sentido-labs.com
# ©2018 Alberto González Palomo https://sentido-labs.com

# This directory is hard-coded in other places which you might have to adapt
# if you chage its location:
# - config-electron-installer-debian.json
# - installers.json
BUILD=../build

NWJS_VERSION=v0.26.6
GW_VERSION=v0.12.0

# Define DEVTOOLS to have a non-empty value to use the SDK version of NW.js.
# http://docs.nwjs.io/en/latest/For%20Users/Advanced/Build%20Flavors/
DEVTOOLS=t

# This removes the line that loads the Google Tag Services
# if we want to exclude it from the installable version.
INDEX_CLEANUP='s/.*googletagservices.com.*//g'
# If it should stay there, just make this a no-op:
#INDEX_CLEANUP=''

.PHONY: all help linux mac windows clean

all: linux mac windows
help:
	@echo '"make"' = make linux mac windows
	@echo '"make windows"' = make mobagm-win-amd64 mobagm-win-ia32
	@echo '"make mac"' = make mobagm-osx-amd64
	@echo '"make linux"' = make mobagm-linux-amd64 mobagm-linux-ia32
	@echo
	@echo '"make clean"' deletes all build directories mobagm-*
	@echo 
linux: mobagm-linux-amd64 mobagm-linux-ia32
mac: mobagm-osx-amd64
windows: mobagm-win-amd64 mobagm-win-ia32
clean:
	rm -rf mobagm-*

LINUX64_GREENWORKS=greenworks-$(GW_VERSION)-nw-$(NWJS_VERSION)-linux-x64.zip
LINUX32_GREENWORKS=greenworks-$(GW_VERSION)-nw-$(NWJS_VERSION)-linux-ia32.zip
OSX64_GREENWORKS=greenworks-$(GW_VERSION)-nw-$(NWJS_VERSION)-osx-x64.zip
WINDOWS64_GREENWORKS=greenworks-$(GW_VERSION)-nw-$(NWJS_VERSION)-win-x64.zip
WINDOWS32_GREENWORKS=greenworks-$(GW_VERSION)-nw-$(NWJS_VERSION)-win-ia32.zip

ifndef DEVTOOLS
	LINUX64_NWJS=nwjs-$(NWJS_VERSION)-linux-x64.tar.gz
	LINUX32_NWJS=nwjs-$(NWJS_VERSION)-linux-ia32.tar.gz
	OSX64_NWJS=nwjs-$(NWJS_VERSION)-osx-x64.zip
	WINDOWS64_NWJS=nwjs-$(NWJS_VERSION)-win-x64.zip
	WINDOWS32_NWJS=nwjs-$(NWJS_VERSION)-win-ia32.zip
else
	LINUX64_NWJS=nwjs-sdk-$(NWJS_VERSION)-linux-x64.tar.gz
	LINUX32_NWJS=nwjs-sdk-$(NWJS_VERSION)-linux-ia32.tar.gz
	OSX64_NWJS=nwjs-sdk-$(NWJS_VERSION)-osx-x64.zip
	WINDOWS64_NWJS=nwjs-sdk-$(NWJS_VERSION)-win-x64.zip
	WINDOWS32_NWJS=nwjs-sdk-$(NWJS_VERSION)-win-ia32.zip
endif

mobagm-linux-amd64: sdk $(LINUX64_NWJS) $(LINUX64_GREENWORKS)
	rsync -ra --delete --exclude-from=exclude $(BUILD)/ $@ -r
	sed $(INDEX_CLEANUP) <$(BUILD)/index.html >$@/index.html
	rsync -ra --delete --exclude-from=exclude vendor $@ -r
	rsync -ra --delete --exclude-from=exclude nwjsroot/* app $@/ -r
	unzip -d $@/app/ $(LINUX64_GREENWORKS)
	cp sdk/redistributable_bin/linux64/libsteam_api.so $@/app/lib/
	cp sdk/public/steam/lib/linux64/libsdkencryptedappticket.so $@/app/lib/
	tar xf $(LINUX64_NWJS) --directory=$@ --strip-components=1
	mv $@/nw $@/mobagm

mobagm-linux-ia32: sdk $(LINUX32_NWJS) $(LINUX32_GREENWORKS)
	rsync -ra --delete --exclude-from=exclude $(BUILD)/ $@ -r
	sed $(INDEX_CLEANUP) <$(BUILD)/index.html >$@/index.html
	rsync -ra --delete --exclude-from=exclude vendor $@ -r
	rsync -ra --delete --exclude-from=exclude nwjsroot/* app $@/ -r
	unzip -d $@/app/ $(LINUX32_GREENWORKS)
	cp sdk/redistributable_bin/linux32/libsteam_api.so $@/app/lib/
	cp sdk/public/steam/lib/linux32/libsdkencryptedappticket.so $@/app/lib/
	tar xf $(LINUX32_NWJS) --directory=$@ --strip-components=1
	mv $@/nw $@/mobagm

mobagm-osx-amd64: sdk $(OSX64_NWJS) $(OSX64_GREENWORKS)
	rm -rf $@
	mkdir $@
	unzip -d $@ $(OSX64_NWJS)
	mv $@/nwjs-*/nwjs.app $@/mobagm.app
	rm $@/nwjs-* -r
	$(eval APP=$@/mobagm.app/Contents/Resources/app.nw)
	mkdir -p $(APP)
	rsync -ra --delete --exclude-from=exclude $(BUILD)/ $(APP) -r
	sed $(INDEX_CLEANUP) <$(BUILD)/index.html >$(APP)/index.html
	rsync -ra --delete --exclude-from=exclude vendor $(APP) -r
	rsync -ra --delete --exclude-from=exclude nwjsroot/* app $(APP)/ -r
	cp $(APP)/img/mobagm-icon.icns $(APP)/../app.icns
	unzip -d $(APP)/app/ $(OSX64_GREENWORKS)
	cp sdk/redistributable_bin/osx32/libsteam_api.dylib $(APP)/app/lib/
	cp sdk/public/steam/lib/osx32/libsdkencryptedappticket.dylib $(APP)/app/lib/

mobagm-win-amd64: sdk $(WINDOWS64_NWJS) $(WINDOWS64_GREENWORKS)
	rsync -ra --delete --exclude-from=exclude $(BUILD)/ $@ -r
	sed $(INDEX_CLEANUP) <$(BUILD)/index.html >$@/index.html
	rsync -ra --delete --exclude-from=exclude vendor $@ -r
	rsync -ra --delete --exclude-from=exclude nwjsroot/* app $@/ -r
	unzip -d $@/app/ $(WINDOWS64_GREENWORKS)
	cp sdk/redistributable_bin/win64/steam_api64.dll $@/app/lib/
	cp sdk/public/steam/lib/win64/sdkencryptedappticket64.dll $@/app/lib/
	unzip -d $@ $(WINDOWS64_NWJS); mv $@/nwjs-*/* $@; rm $@/nwjs-* -r
	mv $@/nw.exe $@/mobagm.exe

mobagm-win-ia32: sdk $(WINDOWS32_NWJS) $(WINDOWS32_GREENWORKS)
	rsync -ra --delete --exclude-from=exclude $(BUILD)/ $@ -r
	sed $(INDEX_CLEANUP) <$(BUILD)/index.html >$@/index.html
	rsync -ra --delete --exclude-from=exclude vendor $@ -r
	rsync -ra --delete --exclude-from=exclude nwjsroot/* app $@/ -r
	unzip -d $@/app/ $(WINDOWS32_GREENWORKS)
	cp sdk/redistributable_bin/steam_api.dll $@/app/lib/
	cp sdk/public/steam/lib/win32/sdkencryptedappticket.dll $@/app/lib/
	unzip -d $@ $(WINDOWS32_NWJS); mv $@/nwjs-*/* $@; rm $@/nwjs-* -r
	mv $@/nw.exe $@/mobagm.exe

nwjs-%.tar.gz:
	wget https://dl.nwjs.io/$(NWJS_VERSION)/$@
nwjs-%.zip:
	wget https://dl.nwjs.io/$(NWJS_VERSION)/$@

greenworks-$(GW_VERSION)-nw-%.zip:
	wget -c https://github.com/greenheartgames/greenworks/releases/download/$(GW_VERSION)/$@

sdk:
	@echo You need to unpack the SteamWorks SDK v1.41 as "./sdk"
	@exit 1
