.PHONY: setup run test down coverage

setup:
	pnpm install
	docker compose up -d postgres chroma serverest

run:
	pnpm dev

test:
	pnpm test

coverage:
	pnpm coverage

down:
	docker compose down

