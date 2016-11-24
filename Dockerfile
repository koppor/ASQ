FROM asqhub/base-image:master

MAINTAINER Vincenzo FERME <info@vincenzoferme.it>

ENV ASQDIR /ASQ

ARG CI_USER_TOKEN
ENV CI_USER_TOKEN ${CI_USER_TOKEN}

# Setup Dependencies
RUN apt-get update -q \
	&& apt-get install -y -q --no-install-recommends git python build-essential software-properties-common cmake make unzip \
	&& apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false -o APT::AutoRemove::SuggestsImportant=false \
	# Clean up APT when done.
    && apt-get clean autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*

# Adds pdf2htmlEX
RUN add-apt-repository "deb http://archive.ubuntu.com/ubuntu/ trusty multiverse" \
    && add-apt-repository "deb http://archive.ubuntu.com/ubuntu/ trusty-updates multiverse" \
    && apt-get update -qq \
    && add-apt-repository ppa:fontforge/fontforge --yes \
    && add-apt-repository ppa:delayargentina/delayx --yes \
    && apt-get update -qq \
    && apt-get install -y --force-yes -q --no-install-recommends libpoppler-dev libpoppler-private-dev libspiro-dev libcairo-dev libpango1.0-dev libfreetype6-dev libltdl-dev libfontforge-dev python-imaging python-pip rsync \
    && git clone https://github.com/coolwanglu/pdf2htmlEX.git \
    && cd pdf2htmlEX \
    && cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DENABLE_SVG=ON . \
    && make \
    && make install \
    && cd .. \
    && rm -R pdf2htmlEX \
    # Clean up APT when done.
    && apt-get clean autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/lib/{apt,dpkg,cache,log}/ /tmp/* /var/tmp/*

# Build performance improvement: http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
ADD package.json /tmp/package.json
ADD bower.json /tmp/bower.json
ADD config/* /tmp/config/
ADD tasks/* /tmp/tasks/
ADD client/presenterControl/* /tmp/client/presenterControl/
RUN cd /tmp && npm install --unsafe-perm \
    && mkdir -p $ASQDIR && mkdir -p $ASQDIR/log && cp -a /tmp/node_modules $ASQDIR \
    # Clean up when done.
    && rm -rf /tmp/* /var/tmp/*

# LOAD ASQ
# Copy ASQ
COPY . $ASQDIR
WORKDIR $ASQDIR

# Install ASQ
RUN npm install --unsafe-perm \
    && npm run build \
		# Uninstall dev dependencies AND Dependencies not needed at runtime
    && npm prune --production \
    && apt-get remove -y --purge python build-essential \
		# Clean up when done.
    && rm -rf /tmp/* /var/tmp/*

# CONFIGURE NGINX, RUNIT
# CONFIGURE NGINX
# Copy custom configuration file from the current directory
RUN cp $ASQDIR/lib/support/nginx/asq.conf /etc/nginx/sites-available/default.conf \
    && ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf \
    # CONFIGURE RUNIT
    # Nginx
    && mkdir /etc/service/nginx \
    && cp $ASQDIR/lib/support/docker/runit/nginx.sh /etc/service/nginx/run \
    && chmod +x /etc/service/nginx/run \
    # Asq
    && mkdir /etc/service/asq \
    && cp $ASQDIR/lib/support/docker/runit/asq.sh /etc/service/asq/run \
    && chmod +x /etc/service/asq/run

#Configure Image
VOLUME ["/ASQ/slides"]
#EXPOSE 3000
