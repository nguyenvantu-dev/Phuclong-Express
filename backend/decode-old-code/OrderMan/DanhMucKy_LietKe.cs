using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhMucKy_LietKe : Page
{
	protected GridView gvDanhMucKy;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDanhSachKy();
		}
	}

	private void LoadDanhSachKy()
	{
		BLL bLL = new BLL();
		List<Ky> dataSource = bLL.LayDanhSachKy();
		gvDanhMucKy.DataSource = dataSource;
		gvDanhMucKy.DataBind();
	}

	protected void gvDanhMucKy_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int kyID = Convert.ToInt32(gvDanhMucKy.DataKeys[e.RowIndex]["KyID"]);
			DBConnect dBConnect = new DBConnect();
			switch (dBConnect.XoaKy(kyID))
			{
			case 0:
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_LietKe:XoaKy", StringEnum.GetStringValue(HanhDong.Xoa), kyID.ToString(), "KyID: " + kyID);
				LoadDanhSachKy();
				break;
			case 1:
				base.Response.Write("<script>alert('Kỳ đã phát sinh dữ liệu. Không thực hiện xóa');</script>");
				break;
			case -1:
				base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
				break;
			}
		}
		catch
		{
		}
	}

	protected void gvDanhMucKy_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			if (e.CommandName == "DongKy")
			{
				DBConnect dBConnect = new DBConnect();
				int kyCanDongID = Convert.ToInt32(e.CommandArgument);
				switch (dBConnect.DongKy(kyCanDongID, "", LaKyDauTien: false, base.User.Identity.GetUserName()))
				{
				case 0:
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhMucKy_LietKe:DongKy", StringEnum.GetStringValue(HanhDong.ChinhSua), kyCanDongID.ToString(), "Đóng kỳ ID: " + kyCanDongID);
					LoadDanhSachKy();
					break;
				case 1:
					base.Response.Write("<script>alert('Kỳ trước chưa đóng. Không thực hiện đóng kỳ này');</script>");
					break;
				case 2:
					base.Response.Write("<script>alert('Không có kỳ liền kề trước. Không thực hiện đóng kỳ này');</script>");
					break;
				case 3:
					base.Response.Write("<script>alert('Có dữ liệu công nợ trước ngày đóng chưa duyệt. Không thực hiện đóng kỳ này');</script>");
					break;
				case -1:
					base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
					break;
				}
			}
		}
		catch
		{
		}
	}
}
