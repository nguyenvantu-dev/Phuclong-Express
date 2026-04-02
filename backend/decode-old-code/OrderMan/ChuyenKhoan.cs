using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class ChuyenKhoan : Page
{
	protected Literal ErrorMessage;

	protected DropDownList ddNganHang;

	protected TextBox tbNgayChuyenKhoan;

	protected TextBox tbSoTienChuyenKhoan;

	protected TextBox tbNoiDung;

	protected Button btTaoChuyenKhoan;

	protected GridView gvChuyenKhoanDangChoDuyet;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachTaiKhoanNganHang();
			LoadDanhSachCongNo();
		}
	}

	protected void btTaoChuyenKhoan_Click(object sender, EventArgs e)
	{
		if (!double.TryParse(tbSoTienChuyenKhoan.Text.Trim(), out var result))
		{
			ErrorMessage.Text = "Tiền Có phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.Insert_CongNo(base.User.Identity.GetUserName(), tbNoiDung.Text.Trim(), DateTimeUtil.getDatetimeFromStrWithCurrentMinute(tbNgayChuyenKhoan.Text.Trim()), 0.0, result, "Báo chuyển khoản - " + ddNganHang.SelectedValue, Status: false, null, base.User.Identity.GetUserName(), 2))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ChuyenKhoan:Insert_CongNo", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "NgayChuyenKhoan: " + tbNgayChuyenKhoan.Text.Trim() + "; DR: 0; CR: " + result + "; GhiChu: Báo chuyển khoản - " + ddNganHang.SelectedValue);
			tbNgayChuyenKhoan.Text = "";
			tbSoTienChuyenKhoan.Text = "";
			tbNoiDung.Text = "";
			LoadDanhSachCongNo();
		}
	}

	private void LoadDanhSachTaiKhoanNganHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddNganHang.DataSource = dBConnect.LayDanhSachTaiKhoanNganHang();
			ddNganHang.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDanhSachCongNo()
	{
		try
		{
			BLL bLL = new BLL();
			CongNoPhanTrang congNoPhanTrang = bLL.LayDanhSachCongNo(base.User.Identity.GetUserName(), 0, 2, "", "", "", 100, 1);
			gvChuyenKhoanDangChoDuyet.DataSource = congNoPhanTrang.DanhSachCongNo;
			gvChuyenKhoanDangChoDuyet.DataBind();
		}
		catch
		{
		}
	}
}
