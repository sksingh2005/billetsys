#
# Eclipse Public License - v 2.0
#
# THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
# PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
# OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
#

.PHONY: all format clean run test docs

all: clean format run

format:
	@npm run frontend:fix -q
	@npm run frontend:check -q

clean:
	@mvn clean

run:
	@mvn quarkus:dev

test:
	@mvn test

docs:
	@mvn -Pmanual-docs generate-resources
