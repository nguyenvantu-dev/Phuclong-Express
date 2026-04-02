using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhMucWebsite : Page
{
	protected Label lbLoi;

	protected TextBox tbWebsiteName;

	protected TextBox tbGhiChu;

	protected Button btLuu;

	protected GridView gvWebsite;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachWebsite();
		}
	}

	private void LoadDanhSachWebsite()
	{
		DBConnect dBConnect = new DBConnect();
		gvWebsite.DataSource = dBConnect.LayDanhSachWebsite();
		gvWebsite.DataBind();
	}

	protected void gvWebsite_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvWebsite.EditIndex = e.NewEditIndex;
			LoadDanhSachWebsite();
		}
		catch (Exception)
		{
		}
	}

	protected void gvWebsite_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			TextBox textBox = gvWebsite.Rows[e.RowIndex].FindControl("tbgvWebsiteName") as TextBox;
			TextBox textBox2 = gvWebsite.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			if (string.IsNullOrEmpty(textBox.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng điền đầy đủ thông tin bắt buộc!!!";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CapNhatWebsite(Convert.ToInt32(gvWebsite.DataKeys[e.RowIndex]["ID"]), textBox.Text.Trim(), textBox2.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucWebsite:CapNhatWebsite", StringEnum.GetStringValue(HanhDong.ChinhSua), gvWebsite.DataKeys[e.RowIndex]["ID"].ToString(), "ID: " + gvWebsite.DataKeys[e.RowIndex]["ID"].ToString() + "; WebsiteName: " + textBox.Text.Trim() + "; GhiChu: " + textBox2.Text.Trim());
			gvWebsite.EditIndex = -1;
			LoadDanhSachWebsite();
		}
		catch (Exception)
		{
		}
	}

	protected void gvWebsite_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvWebsite.EditIndex = -1;
		LoadDanhSachWebsite();
	}

	protected void btLuu_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbWebsiteName.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập Tên thông tin";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemWebsite(tbWebsiteName.Text.Trim(), tbGhiChu.Text.Trim());
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucWebsite:ThemWebsite", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "; WebsiteName: " + tbWebsiteName.Text.Trim() + "; GhiChu: " + tbGhiChu.Text.Trim());
		LoadDanhSachWebsite();
	}

	protected void gvWebsite_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvWebsite.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaWebsite(iD))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucWebsite:XoaWebsite", StringEnum.GetStringValue(HanhDong.Xoa), iD.ToString(), "ID: " + iD);
				LoadDanhSachWebsite();
			}
		}
		catch
		{
		}
	}
}
