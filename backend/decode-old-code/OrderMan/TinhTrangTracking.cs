namespace OrderMan;

public enum TinhTrangTracking
{
	[StringValue("Received")]
	Received,
	[StringValue("InTransit")]
	InTransit,
	[StringValue("InVN")]
	InVN,
	[StringValue("VNTransit")]
	VNTransit,
	[StringValue("Completed")]
	Completed,
	[StringValue("Cancelled")]
	Cancelled
}
