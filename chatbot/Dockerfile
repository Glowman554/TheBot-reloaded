FROM openjdk:11

RUN wget https://github.com/TheBot-core/chatbot/releases/download/1/chatbot.jar
RUN wget https://github.com/TheBot-core/chatbot/releases/download/1/resources.zip

RUN unzip resources.zip -d resources

ENTRYPOINT [ "java", "-jar", "chatbot.jar" ]