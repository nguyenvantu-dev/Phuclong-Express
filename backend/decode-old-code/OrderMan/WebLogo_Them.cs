using System;
using System.IO;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class WebLogo_Them : Page
{
	protected Label lbLoi;

	protected TextBox tbNoiDung;

	protected TextBox tbLinkWeb;

	protected TextBox tbThuTu;

	protected FileUpload fuHinhAnh;

	protected Button btThayDoiHinhAnh;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataWebLogo();
		}
	}

	private void LoadDataWebLogo()
	{
		BLL bLL = new BLL();
		WebLogo webLogo = bLL.LayWebLogoByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		tbNoiDung.Text = webLogo.NoiDung;
		tbLinkWeb.Text = webLogo.LinkWeb;
		tbThuTu.Text = webLogo.ThuTu.ToString();
		btThayDoiHinhAnh.Visible = true;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		int result = 0;
		if (string.IsNullOrEmpty(tbNoiDung.Text.Trim()) || string.IsNullOrEmpty(tbLinkWeb.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập đủ thông tin";
			return;
		}
		if (string.IsNullOrEmpty(tbThuTu.Text.Trim()))
		{
			result = 0;
		}
		else if (!int.TryParse(tbThuTu.Text.Trim(), out result))
		{
			lbLoi.Text = "Thứ tự phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
		{
			if (string.IsNullOrEmpty(fuHinhAnh.FileName))
			{
				lbLoi.Text = "Vui lòng chọn file hình";
				return;
			}
			string text = base.Server.MapPath("/imgWebLogo") + "\\";
			string text2 = text + fuHinhAnh.FileName;
			while (File.Exists(text2))
			{
				File.Delete(text2);
			}
			try
			{
				fuHinhAnh.SaveAs(text2);
				dBConnect.ThemWebLogo(fuHinhAnh.FileName, tbNoiDung.Text.Trim(), tbLinkWeb.Text.Trim(), result);
			}
			catch (Exception)
			{
			}
		}
		else
		{
			dBConnect.CapNhatWebLogo(Convert.ToInt32(Page.Request.QueryString["id"]), tbNoiDung.Text.Trim(), tbLinkWeb.Text.Trim(), result);
		}
		Page.Response.Redirect("/admin/WebLogo_LietKe.aspx");
	}

	protected void btThayDoiHinhAnh_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(fuHinhAnh.FileName))
		{
			lbLoi.Text = "Vui lòng chọn file hình";
			return;
		}
		string text = base.Server.MapPath("/imgWebLogo") + "\\";
		string text2 = text + fuHinhAnh.FileName;
		while (File.Exists(text2))
		{
			File.Delete(text2);
		}
		try
		{
			fuHinhAnh.SaveAs(text2);
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatHinhAnhWebLogo(Convert.ToInt32(Page.Request.QueryString["id"]), fuHinhAnh.FileName);
		}
		catch (Exception)
		{
		}
	}
}
