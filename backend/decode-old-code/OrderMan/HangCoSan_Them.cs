using System;
using System.Drawing;
using System.IO;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class HangCoSan_Them : Page
{
	protected Label lbLoi;

	protected TextBox tbMaSoHang;

	protected TextBox tbTenHang;

	protected TextBox tbLinkHang;

	protected TextBox tbGiaTien;

	protected TextBox tbMoTa;

	protected DropDownList drSoSao;

	protected TextBox tbThuTu;

	protected FileUpload fuHinhAnh;

	protected Button btThayDoiHinhAnh;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataHangCoSan();
		}
	}

	private void LoadDataHangCoSan()
	{
		BLL bLL = new BLL();
		HangCoSan hangCoSan = bLL.LayHangCoSanByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		tbMaSoHang.Text = hangCoSan.MaSoHang;
		tbTenHang.Text = hangCoSan.TenHang;
		tbLinkHang.Text = hangCoSan.LinkHang;
		if (hangCoSan.GiaTien.HasValue)
		{
			tbGiaTien.Text = hangCoSan.GiaTien.ToString();
		}
		else
		{
			tbGiaTien.Text = "";
		}
		tbMoTa.Text = hangCoSan.MoTa;
		try
		{
			drSoSao.ClearSelection();
			if (hangCoSan.SoSao.HasValue)
			{
				drSoSao.Items.FindByValue(hangCoSan.SoSao.Value.ToString()).Selected = true;
			}
		}
		catch
		{
		}
		if (hangCoSan.ThuTu.HasValue)
		{
			tbThuTu.Text = hangCoSan.ThuTu.ToString();
		}
		else
		{
			tbThuTu.Text = "";
		}
		btThayDoiHinhAnh.Visible = true;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		int result = 0;
		int num = 0;
		int result2 = 0;
		if (string.IsNullOrEmpty(tbTenHang.Text.Trim()) || string.IsNullOrEmpty(tbMaSoHang.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập đủ thông tin";
			return;
		}
		if (string.IsNullOrEmpty(tbGiaTien.Text.Trim()))
		{
			result = 0;
		}
		else if (!int.TryParse(tbGiaTien.Text.Trim(), out result))
		{
			lbLoi.Text = "Giá tiền phải là kiểu số";
			return;
		}
		num = int.Parse(drSoSao.SelectedValue);
		if (string.IsNullOrEmpty(tbThuTu.Text.Trim()))
		{
			result2 = 0;
		}
		else if (!int.TryParse(tbThuTu.Text.Trim(), out result2))
		{
			lbLoi.Text = "Thứ tự phải là kiểu số";
			return;
		}
		string noiDungTimKiem = Utils.Convert2NoSign(tbTenHang.Text.Trim() + " " + tbMoTa.Text.Trim());
		DBConnect dBConnect = new DBConnect();
		if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
		{
			if (string.IsNullOrEmpty(fuHinhAnh.FileName))
			{
				lbLoi.Text = "Vui lòng chọn file hình";
				return;
			}
			string text = base.Server.MapPath("/imgHangCoSan") + "\\";
			string text2 = Guid.NewGuid().ToString() + Path.GetExtension(fuHinhAnh.FileName);
			string filename = text + text2;
			try
			{
				fuHinhAnh.SaveAs(filename);
				System.Drawing.Image image = System.Drawing.Image.FromFile(filename);
				System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
				image.Dispose();
				image2.Save(filename);
				dBConnect.ThemHangCoSan(text2, tbTenHang.Text.Trim(), tbLinkHang.Text.Trim(), result, tbMoTa.Text.Trim(), num, result2, noiDungTimKiem, tbMaSoHang.Text.Trim());
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HangCoSan_Them:ThemHangCoSan", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "TenHinh: " + fuHinhAnh.FileName + "; TenHang: " + tbTenHang.Text.Trim() + "; GiaTien: " + result + "; MoTa: " + tbMoTa.Text.ToString() + "; SoSao: " + num + "; ThuTu: " + result2);
			}
			catch (Exception)
			{
			}
		}
		else
		{
			dBConnect.CapNhatHangCoSan(Convert.ToInt32(Page.Request.QueryString["id"]), tbTenHang.Text.Trim(), tbLinkHang.Text.Trim(), result, tbMoTa.Text.Trim(), num, result2, noiDungTimKiem, tbMaSoHang.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HangCoSan_Them:CapNhatHangCoSan", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; TenHinh: " + fuHinhAnh.FileName + "; TenHang: " + tbTenHang.Text.Trim() + "; GiaTien: " + result + "; MoTa: " + tbMoTa.Text.ToString() + "; SoSao: " + num + "; ThuTu: " + result2);
		}
		Page.Response.Redirect("/admin/HangCoSan_LietKe.aspx");
	}

	protected void btThayDoiHinhAnh_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(fuHinhAnh.FileName))
		{
			lbLoi.Text = "Vui lòng chọn file hình";
			return;
		}
		string text = base.Server.MapPath("/imgHangCoSan") + "\\";
		string text2 = Guid.NewGuid().ToString() + Path.GetExtension(fuHinhAnh.FileName);
		string text3 = text + text2;
		while (File.Exists(text3))
		{
			File.Delete(text3);
		}
		try
		{
			fuHinhAnh.SaveAs(text3);
			System.Drawing.Image image = System.Drawing.Image.FromFile(text3);
			System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
			image.Dispose();
			image2.Save(text3);
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatHinhAnhHangCoSan(Convert.ToInt32(Page.Request.QueryString["id"]), text2);
		}
		catch (Exception)
		{
		}
	}
}
