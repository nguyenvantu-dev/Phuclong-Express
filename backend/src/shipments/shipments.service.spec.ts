import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { NotFoundException } from '@nestjs/common';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let shipmentRepository: Repository<Shipment>;
  let orderRepository: Repository<Order>;

  const mockShipmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  const mockOrderRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    shipmentRepository = module.get<Repository<Shipment>>(getRepositoryToken(Shipment));
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shipment with auto-generated tenDotHang', async () => {
      const createDto = { username: 'testuser' };
      const expectedShipment = {
        id: 1,
        tenDotHang: '18-03-2026_testuser',
        username: 'testuser',
        yeuCauGuiHang: 0,
        isCompleted: false,
      };

      mockShipmentRepository.create.mockReturnValue(expectedShipment);
      mockShipmentRepository.save.mockResolvedValue(expectedShipment);

      const result = await service.create(createDto);

      expect(mockShipmentRepository.create).toHaveBeenCalled();
      expect(result.tenDotHang).toContain('testuser');
    });

    it('should calculate phiShipVeVnVnd from phiShipVeVnUsd and tyGia', async () => {
      const createDto = {
        username: 'testuser',
        phiShipVeVnUsd: 10,
        tyGia: 25000,
      };
      const expectedShipment = {
        id: 1,
        tenDotHang: '18-03-2026_testuser',
        username: 'testuser',
        phiShipVeVnUsd: 10,
        tyGia: 25000,
        phiShipVeVnVnd: 250000, // 10 * 25000
      };

      mockShipmentRepository.create.mockImplementation((data) => data);
      mockShipmentRepository.save.mockImplementation((data) => Promise.resolve({ id: 1, ...data }));

      const result = await service.create(createDto);

      expect(result.phiShipVeVnVnd).toBe(250000);
    });

    it('should calculate tienHangVnd from tienHangUsd and tyGia', async () => {
      const createDto = {
        username: 'testuser',
        tienHangUsd: 100,
        tyGia: 25000,
      };

      mockShipmentRepository.create.mockImplementation((data) => data);
      mockShipmentRepository.save.mockImplementation((data) => Promise.resolve({ id: 1, ...data }));

      const result = await service.create(createDto);

      expect(result.tienHangVnd).toBe(2500000); // 100 * 25000
    });
  });

  describe('findOne', () => {
    it('should return a shipment by id', async () => {
      const shipment = { id: 1, tenDotHang: '18-03-2026_testuser', username: 'testuser' };
      mockShipmentRepository.findOne.mockResolvedValue(shipment);

      const result = await service.findOne(1);

      expect(result).toEqual(shipment);
    });

    it('should throw NotFoundException if shipment not found', async () => {
      mockShipmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should recalculate totals when tyGia changes', async () => {
      const existingShipment = {
        id: 1,
        tenDotHang: '18-03-2026_testuser',
        username: 'testuser',
        phiShipVeVnUsd: 10,
        tyGia: 25000,
        phiShipVeVnVnd: 250000,
        tienHangUsd: 100,
        tienHangVnd: 2500000,
      };

      mockShipmentRepository.findOne.mockResolvedValue(existingShipment);
      mockShipmentRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.update(1, { tyGia: 26000 });

      expect(result.phiShipVeVnVnd).toBe(260000); // 10 * 26000
      expect(result.tienHangVnd).toBe(2600000); // 100 * 26000
    });
  });

  describe('complete', () => {
    it('should mark shipment as completed', async () => {
      const shipment = {
        id: 1,
        tenDotHang: '18-03-2026_testuser',
        isCompleted: false,
      };
      const completedShipment = { ...shipment, isCompleted: true };

      mockShipmentRepository.findOne.mockResolvedValue(shipment);
      mockShipmentRepository.save.mockResolvedValue(completedShipment);

      const result = await service.complete(1);

      expect(result.isCompleted).toBe(true);
    });
  });

  describe('getOrders', () => {
    it('should return orders linked to the shipment', async () => {
      const shipment = {
        id: 1,
        tenDotHang: '18-03-2026_testuser',
      };
      const orders = [
        { id: 1, orderNumber: 'ORD-001', tenDotHang: '18-03-2026_testuser' },
        { id: 2, orderNumber: 'ORD-002', tenDotHang: '18-03-2026_testuser' },
      ];

      mockShipmentRepository.findOne.mockResolvedValue(shipment);
      mockOrderRepository.find.mockResolvedValue(orders);

      const result = await service.getOrders(1);

      expect(result).toEqual(orders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { tenDotHang: '18-03-2026_testuser' },
        order: { id: 'ASC' },
      });
    });
  });
});
