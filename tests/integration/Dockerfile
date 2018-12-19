FROM python:3.7

WORKDIR /usr/src/app

COPY tests/integration .
COPY swagger.yaml .

RUN pip install --no-cache-dir -r requirements.txt

USER nobody:nogroup

CMD ["python", "integration-test.py", "--config=configuration.json", "--openapi=swagger.yaml", "-v"]
