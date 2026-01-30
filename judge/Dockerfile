# using a slim linux os with node already installed.
# on base image we will install runtimes for c++, python & java
FROM node:20-bullseye-slim

# runtime installation
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      openjdk-17-jdk \
      python3 \
      g++ \
      ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user |essential for security aspect|
RUN useradd -m runner
WORKDIR /runner

# Copy runner script into image
COPY run.sh /runner/run.sh
RUN chmod +x /runner/run.sh

# Default user inside container
USER runner

# Default command (we'll override in docker run)
CMD ["/runner/run.sh"]
