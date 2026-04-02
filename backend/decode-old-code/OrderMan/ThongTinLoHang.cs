using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class ThongTinLoHang : Page
{
	private int pageNum = 1;

	private int pageSize = 10000;

	protected DropDownList ddLoHang;

	protected Button btTim;

	protected Label Label1;

	protected Label lbTyGia;

	protected Label lbLoaiTien;

	protected Label lbNgayDenDuKien;

	protected Label lbNgayDenThucTe;

	protected Panel pnPhiShipVeVN;

	protected GridView gvShipVeVN;

	protected Panel pnThueHaiQuan;

	protected GridView gvThueHaiQuan;

	protected Panel pnTracking;

	protected GridView gvTracking;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachLoHang();
			LoadChiTietLoHang();
		}
	}

	private void LoadDanhSachLoHang()
	{
		try
		{
			BLL bLL = new BLL();
			LoHangPhanTrang loHangPhanTrang = bLL.LayDanhSachLoHang(base.User.Identity.GetUserName(), null, null, pageSize, pageNum);
			ddLoHang.DataSource = loHangPhanTrang.DanhSachLoHang;
			ddLoHang.DataBind();
		}
		catch
		{
		}
	}

	protected void btTim_Click(object sender, EventArgs e)
	{
		LoadChiTietLoHang();
	}

	private void LoadChiTietLoHang()
	{
		try
		{
			LoadDataLoHang(Convert.ToInt32(ddLoHang.SelectedValue));
			LoadDataLoHang_PhiShipVeVN(Convert.ToInt32(ddLoHang.SelectedValue));
			LoadDataLoHang_ThueHaiQuan(Convert.ToInt32(ddLoHang.SelectedValue));
			LoadDanhTracking();
		}
		catch
		{
		}
	}

	private void LoadDataLoHang(int LoHangID)
	{
		BLL bLL = new BLL();
		LoHang loHang = bLL.LayLoHangByID(LoHangID);
		lbTyGia.Text = loHang.TyGia.ToString();
		lbLoaiTien.Text = loHang.LoaiTien;
		if (loHang.NgayDenDuKien.HasValue)
		{
			lbNgayDenDuKien.Text = loHang.NgayDenDuKien.Value.ToString("dd/MM/yyyy");
		}
		if (loHang.NgayDenThucTe.HasValue)
		{
			lbNgayDenThucTe.Text = loHang.NgayDenThucTe.Value.ToString("dd/MM/yyyy");
		}
	}

	private void LoadDataLoHang_PhiShipVeVN(int LoHangID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachLoHang_PhiShipVeVNByID(LoHangID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvShipVeVN.DataSource = dataSet;
			pnPhiShipVeVN.Visible = true;
		}
		else
		{
			pnPhiShipVeVN.Visible = false;
		}
		gvShipVeVN.DataBind();
	}

	private void LoadDataLoHang_ThueHaiQuan(int LoHangID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachLoHang_ThueHaiQuanByID(LoHangID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvThueHaiQuan.DataSource = dataSet;
			pnThueHaiQuan.Visible = true;
		}
		else
		{
			pnThueHaiQuan.Visible = false;
		}
		gvThueHaiQuan.DataBind();
	}

	private void LoadDanhTracking()
	{
		BLL bLL = new BLL();
		TrackingPhanTrang trackingPhanTrang = bLL.LayDanhSachTracking(base.User.Identity.GetUserName(), "", "", -1, "", ddLoHang.SelectedItem.Text, -1, DaXoa: false, "", "", 10000, 1);
		gvTracking.DataSource = trackingPhanTrang.DanhSachTracking;
		gvTracking.DataBind();
		if (trackingPhanTrang.DanhSachTracking != null && trackingPhanTrang.DanhSachTracking.Count > 0)
		{
			pnTracking.Visible = true;
		}
		else
		{
			pnTracking.Visible = false;
		}
	}
}
