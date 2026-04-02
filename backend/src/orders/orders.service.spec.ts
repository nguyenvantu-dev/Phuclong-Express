import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order with generated order number', async () => {
      const createOrderDto = {
        username: 'testuser',
        donGiaWeb: 100,
        soLuong: 2,
        tyGia: 25000,
      };

      const expectedOrder = {
        id: 1,
        orderNumber: 'ORD-20260318-1234', // Will vary
        username: 'testuser',
        donGiaWeb: 100,
        soLuong: 2,
        tyGia: 25000,
        tongTienUsd: 200,
        tongTienVnd: 5000000, // 200 * 25000
        trangThaiOrder: OrderStatus.RECEIVED,
      };

      mockOrderRepository.create.mockReturnValue(expectedOrder);
      mockOrderRepository.save.mockResolvedValue(expectedOrder);

      const result = await service.create(createOrderDto);

      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
      expect(result.tongTienVnd).toBe(5000000);
    });

    it('should calculate tienCongVND when tyGia is provided', async () => {
      const createOrderDto = {
        username: 'testuser',
        tienCongUsd: 10,
        tyGia: 25000,
      };

      const expectedOrder = {
        id: 1,
        orderNumber: 'ORD-20260318-1234',
        username: 'testuser',
        tienCongUsd: 10,
        tienCongVnd: 250000, // 10 * 25000
        tyGia: 25000,
      };

      mockOrderRepository.create.mockReturnValue(expectedOrder);
      mockOrderRepository.save.mockResolvedValue(expectedOrder);

      const result = await service.create(createOrderDto);

      expect(result.tienCongVnd).toBe(250000);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const order = { id: 1, username: 'testuser' };
      mockOrderRepository.findOne.mockResolvedValue(order);

      const result = await service.findOne(1);

      expect(result).toEqual(order);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const orders = [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' },
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([orders, 2]),
      };

      mockOrderRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(orders);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete an order', async () => {
      const order = { id: 1, isDeleted: false };
      mockOrderRepository.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue({ ...order, isDeleted: true });

      await service.remove(1);

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: true }),
      );
    });
  });
});
