.PHONY: dev be fe install

## Chạy BE + FE cùng lúc (mỗi cái 1 terminal riêng qua tmux / gnome-terminal tùy hệ thống)
dev:
	@echo "Starting backend (port 3001) + frontend (port 3000)..."
	@trap 'kill 0' INT; \
	  (cd backend && npm run start:dev) & \
	  (cd frontend && npm run dev) & \
	  wait

## Chỉ chạy backend
be:
	cd backend && npm run start:dev

## Chỉ chạy frontend
fe:
	cd frontend && npm run dev

## Cài dependencies cả hai
install:
	cd backend && npm install
	cd frontend && npm install
