using System;

namespace OrderMan;

public class LuocSuTracking
{
	public int TinhTrangTrackingID { get; set; }

	public int TrackingID { get; set; }

	public string TinhTrang { get; set; }

	public string MoTaTinhTrang { get; set; }

	public DateTime? NgayChuyenTinhTrang { get; set; }

	public string GhiChu { get; set; }

	public string NguoiTao { get; set; }

	public DateTime NgayTao { get; set; }
}
