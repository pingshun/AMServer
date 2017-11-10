LOGDIR = /var/log/amserver

MKDIR = /bin/mkdir

install: logdir

logdir:
	$(MKDIR) -p $(LOGDIR)
