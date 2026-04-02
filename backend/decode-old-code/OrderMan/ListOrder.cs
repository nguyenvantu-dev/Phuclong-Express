using System;

namespace OrderMan;

public class ListOrder
{
	public int ID { get; set; }

	public string OrderNumber { get; set; }

	public int TongSoLink { get; set; }

	public double TongTienOrder { get; set; }

	public int? Card_ID { get; set; }

	public string tracking_number { get; set; }

	public DateTime? NgayNhanTaiNuocNgoai { get; set; }

	public string TrackingLink { get; set; }
}
