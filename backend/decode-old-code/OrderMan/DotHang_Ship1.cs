using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DotHang_Ship1 : Page
{
	public string sDanhSachDiaChi = "";

	protected Label lbLoi;

	protected DropDownList ddShipper;

	protected Label lbHoTen;

	protected Label lbUserName;

	protected Label lbEmail;

	protected Label lbPhoneNumber;

	protected TextBox tbSoVanDon;

	protected TextBox tbNgayGuiHang;

	protected TextBox tbDiaChiNhanHang;

	protected TextBox tbPhiShipTrongNuoc;

	protected TextBox tbDatCoc;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["tdh"];
			string text2 = Page.Request.QueryString["us"];
			if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(text2))
			{
				Page.Response.Redirect("/admin/BaoCao_CongNoTheoDotHang.aspx");
				return;
			}
			lbLoi.Text = "Đang xử lý đợt hàng " + text;
			LoadThongTinUser(text2);
			LoadThongDiaChiTheoUser(text2);
			LoadShipper();
			LoadThongTinDotHang(text2, text);
		}
	}

	private void LoadShipper()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayDanhSachShipper();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				ddShipper.DataSource = dataSet.Tables[0];
				ddShipper.DataBind();
			}
		}
		catch
		{
		}
	}

	private void LoadThongDiaChiTheoUser(string UserName)
	{
		try
		{
			sDanhSachDiaChi = "";
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayDiaChiNhanHangTheoUser(UserName);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				sDanhSachDiaChi = "<datalist id='danhsachdiachiuser'>";
				for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
				{
					sDanhSachDiaChi = sDanhSachDiaChi + "<option>" + ((dataSet.Tables[0].Rows[i]["DiaChi"] == DBNull.Value) ? "" : dataSet.Tables[0].Rows[i]["DiaChi"].ToString()) + "</option>";
				}
				sDanhSachDiaChi += "</datalist>";
			}
		}
		catch
		{
		}
	}

	private void LoadThongTinUser(string username)
	{
		UserManager manager = new UserManager();
		ApplicationUser applicationUser = manager.FindByName(username);
		lbHoTen.Text = applicationUser.HoTen;
		lbUserName.Text = applicationUser.UserName;
		lbEmail.Text = applicationUser.Email;
		lbPhoneNumber.Text = applicationUser.PhoneNumber;
	}

	private void LoadThongTinDotHang(string UserName, string TenDotHang)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.BaoCaoInPhieuShipTheoDotHang(TenDotHang, UserName);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				DataTable dataTable = dataSet.Tables[0];
				double num = ((dataTable.Rows[0]["TienShipTrongNuoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienShipTrongNuoc"]));
				double num2 = ((dataTable.Rows[0]["TienDatCoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataTable.Rows[0]["TienDatCoc"]));
				tbNgayGuiHang.Text = ((dataTable.Rows[0]["NgayGuiHang"] == DBNull.Value) ? "" : ((DateTime)dataTable.Rows[0]["NgayGuiHang"]).ToString("dd/MM/yyyy"));
				tbSoVanDon.Text = ((dataTable.Rows[0]["SoVanDon"] == DBNull.Value) ? "" : dataTable.Rows[0]["SoVanDon"].ToString());
				tbDiaChiNhanHang.Text = ((dataTable.Rows[0]["DiaChiNhanHang"] == DBNull.Value) ? "" : dataTable.Rows[0]["DiaChiNhanHang"].ToString());
				tbPhiShipTrongNuoc.Text = num.ToString("N0");
				tbDatCoc.Text = num2.ToString("N0");
			}
		}
		catch
		{
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		double result;
		if (string.IsNullOrEmpty(tbPhiShipTrongNuoc.Text.Trim()))
		{
			result = 0.0;
		}
		if (!double.TryParse(tbPhiShipTrongNuoc.Text.Trim(), out result))
		{
			lbLoi.Text = "Phí ship trong nước phải là kiểu số";
			return;
		}
		double result2;
		if (string.IsNullOrEmpty(tbDatCoc.Text.Trim()))
		{
			result2 = 0.0;
		}
		if (!double.TryParse(tbDatCoc.Text.Trim(), out result2))
		{
			lbLoi.Text = "Đặt cọc phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatDotHang_Ship1(Page.Request.QueryString["tdh"], Page.Request.QueryString["us"], Convert.ToInt32(ddShipper.SelectedValue), DateTimeUtil.getDatetimeFromStr(tbNgayGuiHang.Text.Trim()), tbSoVanDon.Text.Trim(), result, tbDiaChiNhanHang.Text, result2, base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DotHang_Ship1:CapNhatDotHang_Ship1", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["tdh"], "TenDotHang: " + Page.Request.QueryString["tdh"] + "; User: " + Page.Request.QueryString["us"] + "; Shipper: " + ddShipper.SelectedValue + "; NgayGuiHang: " + tbNgayGuiHang.Text.Trim() + "; SoVanDon: " + tbSoVanDon.Text.Trim() + "; PhiShipTrongNuoc: " + result + "; DiaChiNhanHang: " + tbDiaChiNhanHang.Text.ToString() + "; DatCoc: " + result2);
			Page.Response.Redirect("/admin/BaoCao_CongNoTheoDotHang.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
