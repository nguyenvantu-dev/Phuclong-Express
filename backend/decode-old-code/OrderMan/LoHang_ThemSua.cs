using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class LoHang_ThemSua : Page
{
	protected Label lbLoi;

	protected TextBox tbTrackingNumber;

	protected TextBox tbOrderNumber;

	protected TextBox tbNgayDatHang;

	protected DropDownList ddNhaVanChuyen;

	protected Label lbLoHang;

	protected DropDownList ddLoaiTien;

	protected TextBox tbTygia;

	protected DropDownList ddTinhTrang;

	protected DropDownList ddUserName;

	protected TextBox tbGhichu;

	protected TextBox tbNgayDenDuKien;

	protected TextBox tbNgayDenThucTe;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataTyGia();
			LoadDataNhaVanChuyen();
			LoadDataUser();
			if (int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				LoadDataLoHang(result);
			}
		}
	}

	private void LoadDataTyGia()
	{
		try
		{
			BLL bLL = new BLL();
			List<TyGia> dataSource = bLL.LayDanhSachTyGia();
			ddLoaiTien.DataSource = dataSource;
			ddLoaiTien.DataBind();
			tbTygia.Text = ddLoaiTien.SelectedValue;
		}
		catch
		{
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDataLoHang(int LoHangID)
	{
	}

	private void LoadDataNhaVanChuyen()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddNhaVanChuyen.DataSource = dBConnect.LayDanhSachNhaVanChuyen();
			ddNhaVanChuyen.DataBind();
		}
		catch
		{
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		double value = Convert.ToDouble(tbTygia.Text.Trim());
		DBConnect dBConnect = new DBConnect();
		DateTime? datetimeFromStr = DateTimeUtil.getDatetimeFromStr(tbNgayDatHang.Text.Trim());
		DateTime? datetimeFromStr2 = DateTimeUtil.getDatetimeFromStr(tbNgayDenDuKien.Text.Trim());
		DateTime? datetimeFromStr3 = DateTimeUtil.getDatetimeFromStr(tbNgayDenThucTe.Text.Trim());
		int result;
		if (string.IsNullOrEmpty(tbTrackingNumber.Text.Trim()) || string.IsNullOrEmpty(tbNgayDatHang.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập đầy đủ thông tin có dấu *";
		}
		else if (!int.TryParse(Page.Request.QueryString["id"], out result))
		{
			if (dBConnect.ThemLoHang(ddUserName.SelectedValue, tbTrackingNumber.Text.Trim(), tbOrderNumber.Text.Trim(), datetimeFromStr, Convert.ToInt32(ddNhaVanChuyen.SelectedValue), datetimeFromStr.Value.ToString("yyyyMMdd"), ddTinhTrang.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), ddLoaiTien.SelectedItem.Text.Trim(), value, datetimeFromStr2, datetimeFromStr3, base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ThemSua:ThemLoHang", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserName: " + ddUserName.SelectedValue + "TrackingNumber: " + tbTrackingNumber.Text.Trim() + "OrderNumber: " + tbOrderNumber.Text.Trim() + "NgayDatHang: " + (datetimeFromStr.HasValue ? "" : datetimeFromStr.Value.ToString("dd/MM/yyyy")) + "NhaVanChuyen: " + ddNhaVanChuyen.SelectedValue + "TenLoHang: " + datetimeFromStr.Value.ToString("yyyyMMdd") + "TinhTrang: " + ddTinhTrang.SelectedItem.Text.Trim() + "Ghichu: " + tbGhichu.Text.Trim() + "ddLoaiTien: " + ddLoaiTien.SelectedItem.Text.Trim() + "Tygia: " + value + "NgayDenDuKien: " + (datetimeFromStr2.HasValue ? "" : datetimeFromStr2.Value.ToString("dd/MM/yyyy")) + "NgayDenThucTe: " + (datetimeFromStr3.HasValue ? "" : datetimeFromStr3.Value.ToString("dd/MM/yyyy")));
				Page.Response.Redirect("/admin/LoHang_LietKe.aspx");
			}
			else
			{
				lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
			}
		}
	}
}
