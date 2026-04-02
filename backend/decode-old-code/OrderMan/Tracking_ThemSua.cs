using System;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class Tracking_ThemSua : Page
{
	protected Label lbLoi;

	protected TextBox tbTrackingNumber;

	protected TextBox tbOrderNumber;

	protected TextBox tbNgayDatHang;

	protected DropDownList ddNhaVanChuyen;

	protected Label lbLoHang;

	protected DropDownList ddQuocGia;

	protected TextBox tbKien;

	protected TextBox tbMawb;

	protected TextBox tbHawb;

	protected DropDownList ddTinhTrang;

	protected DropDownList ddUserName;

	protected TextBox tbGhichu;

	protected Button btCapNhat;

	protected GridView gvChiTietTracking;

	protected GridView gvTinhTrang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataNhaVanChuyen();
			LoadDataQuocGia();
			LoadDataUser();
			if (int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				LoadDataTracking(result);
				LoadDataChiTietTracking(result);
				LoadDataTinhTrangTracking(result);
			}
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

	private void LoadDataTracking(int TrackingID)
	{
		BLL bLL = new BLL();
		Tracking tracking = bLL.LayTrackingByID(TrackingID);
		try
		{
			ddUserName.ClearSelection();
			ddUserName.Items.FindByValue(tracking.UserName).Selected = true;
		}
		catch
		{
		}
		tbTrackingNumber.Text = tracking.TrackingNumber;
		tbOrderNumber.Text = tracking.OrderNumber;
		if (tracking.NgayDatHang.HasValue)
		{
			tbNgayDatHang.Text = tracking.NgayDatHang.Value.ToString("dd/MM/yyyy");
		}
		try
		{
			ddNhaVanChuyen.ClearSelection();
			ddNhaVanChuyen.Items.FindByValue(tracking.NhaVanChuyenID.ToString()).Selected = true;
		}
		catch
		{
		}
		try
		{
			ddQuocGia.ClearSelection();
			ddQuocGia.Items.FindByValue(tracking.QuocGiaID.ToString()).Selected = true;
		}
		catch
		{
		}
		try
		{
			ddTinhTrang.ClearSelection();
			ddTinhTrang.Items.FindByValue(tracking.TinhTrang).Selected = true;
		}
		catch
		{
		}
		tbGhichu.Text = tracking.GhiChu;
		lbLoHang.Text = tracking.TenLoHang;
		tbKien.Text = tracking.Kien;
		tbMawb.Text = tracking.Mawb;
		tbHawb.Text = tracking.Hawb;
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

	private void LoadDataQuocGia()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddQuocGia.DataSource = dBConnect.LayDanhSachQuocGia();
			ddQuocGia.DataBind();
		}
		catch
		{
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		DateTime? datetimeFromStr = DateTimeUtil.getDatetimeFromStr(tbNgayDatHang.Text.Trim());
		int result;
		if (string.IsNullOrEmpty(tbTrackingNumber.Text.Trim()) || string.IsNullOrEmpty(tbNgayDatHang.Text.Trim()))
		{
			lbLoi.Text = "Vui lòng nhập đầy đủ thông tin có dấu *";
		}
		else if (!int.TryParse(Page.Request.QueryString["id"], out result))
		{
			if (dBConnect.ThemTracking(ddUserName.SelectedValue, tbTrackingNumber.Text.Trim(), tbOrderNumber.Text.Trim(), datetimeFromStr, Convert.ToInt32(ddNhaVanChuyen.SelectedValue), Convert.ToInt32(ddQuocGia.SelectedValue), ddTinhTrang.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), base.User.Identity.GetUserName(), tbKien.Text.Trim(), tbMawb.Text.Trim(), tbHawb.Text.Trim()))
			{
				Page.Response.Redirect("/admin/Tracking_LietKe.aspx");
			}
			else
			{
				lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
			}
		}
		else if (dBConnect.CapNhatTracking(Convert.ToInt32(Page.Request.QueryString["id"]), ddUserName.SelectedValue, tbTrackingNumber.Text.Trim(), tbOrderNumber.Text.Trim(), datetimeFromStr, Convert.ToInt32(ddNhaVanChuyen.SelectedValue), Convert.ToInt32(ddQuocGia.SelectedValue), ddTinhTrang.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), base.User.Identity.GetUserName(), tbKien.Text.Trim(), tbMawb.Text.Trim(), tbHawb.Text.Trim()))
		{
			Page.Response.Redirect("/admin/Tracking_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
		}
	}

	private void LoadDataChiTietTracking(int TrackingID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachChiTietTrackingByID(TrackingID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvChiTietTracking.DataKeyNames = new string[1] { "ChiTietTrackingID" };
			gvChiTietTracking.DataSource = dataSet;
		}
		else
		{
			gvChiTietTracking.DataKeyNames = new string[0];
			gvChiTietTracking.DataSource = new object[1];
		}
		gvChiTietTracking.DataBind();
	}

	protected void gvChiTietTracking_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.DataItem == null)
		{
			e.Row.Visible = false;
		}
	}

	protected void gvChiTietTracking_DataBound(object sender, EventArgs e)
	{
	}

	protected void gvChiTietTracking_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		TextBox textBox = gvChiTietTracking.FooterRow.FindControl("tbftSoLuong") as TextBox;
		TextBox textBox2 = gvChiTietTracking.FooterRow.FindControl("tbftGia") as TextBox;
		TextBox textBox3 = gvChiTietTracking.FooterRow.FindControl("tbftGhiChu") as TextBox;
		TextBox textBox4 = gvChiTietTracking.FooterRow.FindControl("tbftLinkHinh") as TextBox;
		FileUpload fileUpload = gvChiTietTracking.FooterRow.FindControl("fuftHinhAnh") as FileUpload;
		string text = textBox4.Text;
		if (!(e.CommandName == "Insert"))
		{
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (string.IsNullOrEmpty(text) && !string.IsNullOrEmpty(fileUpload.FileName))
		{
			string text2 = DateTime.Now.ToString("yyyyMM");
			string text3 = base.Server.MapPath("/imgLink").TrimEnd('\\') + "\\" + text2 + "\\";
			if (!Directory.Exists(text3))
			{
				Directory.CreateDirectory(text3);
			}
			string text4 = Guid.NewGuid().ToString() + Path.GetExtension(fileUpload.FileName);
			string filename = text3 + text4;
			try
			{
				fileUpload.SaveAs(filename);
				System.Drawing.Image image = System.Drawing.Image.FromFile(filename);
				System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
				image.Dispose();
				image2.Save(filename);
				text = "/imgLink/" + text2 + "/" + text4;
			}
			catch (Exception)
			{
			}
		}
		int trackingID = Convert.ToInt32(Page.Request.QueryString["id"]);
		if (dBConnect.ThemChiTietTracking(trackingID, text, Convert.ToInt32(textBox.Text.Trim()), Convert.ToDouble(textBox2.Text.Trim()), textBox3.Text.Trim()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_ThemSua:ThemChiTietTracking", StringEnum.GetStringValue(HanhDong.ThemMoi), trackingID.ToString(), "TrackingID: " + trackingID + "; LinkHinh: " + text + "; SoLuong: " + textBox.Text.Trim() + "; Gia: " + textBox2.Text.ToString() + "; GhiChu: " + textBox3.Text.ToString());
			LoadDataChiTietTracking(trackingID);
		}
	}

	protected void gvChiTietTracking_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvChiTietTracking.EditIndex = e.NewEditIndex;
			LoadDataChiTietTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
		}
		catch (Exception)
		{
		}
	}

	protected void gvChiTietTracking_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int chiTietTrackingID = Convert.ToInt32(gvChiTietTracking.DataKeys[e.RowIndex]["ChiTietTrackingID"]);
			TextBox textBox = gvChiTietTracking.Rows[e.RowIndex].FindControl("tbgvSoLuong") as TextBox;
			TextBox textBox2 = gvChiTietTracking.Rows[e.RowIndex].FindControl("tbgvGia") as TextBox;
			TextBox textBox3 = gvChiTietTracking.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			TextBox textBox4 = gvChiTietTracking.Rows[e.RowIndex].FindControl("tbgvLinkHinh") as TextBox;
			FileUpload fileUpload = gvChiTietTracking.Rows[e.RowIndex].FindControl("fugvHinhAnh") as FileUpload;
			string text = textBox4.Text;
			DBConnect dBConnect = new DBConnect();
			int trackingID = Convert.ToInt32(Page.Request.QueryString["id"]);
			if (string.IsNullOrEmpty(text) && fileUpload != null && !string.IsNullOrEmpty(fileUpload.FileName))
			{
				string text2 = DateTime.Now.ToString("yyyyMM");
				string text3 = base.Server.MapPath("/imgLink").TrimEnd('\\') + "\\" + text2 + "\\";
				if (!Directory.Exists(text3))
				{
					Directory.CreateDirectory(text3);
				}
				string text4 = Guid.NewGuid().ToString() + Path.GetExtension(fileUpload.FileName);
				string filename = text3 + text4;
				try
				{
					fileUpload.SaveAs(filename);
					System.Drawing.Image image = System.Drawing.Image.FromFile(filename);
					System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
					image.Dispose();
					image2.Save(filename);
					text = "/imgLink/" + text2 + "/" + text4;
				}
				catch (Exception)
				{
				}
			}
			else
			{
				text = "";
			}
			dBConnect.CapNhatChiTietTracking(chiTietTrackingID, text, Convert.ToInt32(textBox.Text.Trim()), Convert.ToDouble(textBox2.Text.Trim()), textBox3.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_ThemSua:CapNhatChiTietTracking", StringEnum.GetStringValue(HanhDong.ChinhSua), chiTietTrackingID.ToString(), "ChiTietTrackingID: " + chiTietTrackingID + "; LinkHinh: " + text + "; SoLuong: " + textBox.Text.Trim() + "; Gia: " + textBox2.Text.ToString() + "; GhiChu: " + textBox3.Text.ToString());
			gvChiTietTracking.EditIndex = -1;
			LoadDataChiTietTracking(trackingID);
		}
		catch (Exception)
		{
		}
	}

	protected void gvChiTietTracking_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvChiTietTracking.EditIndex = -1;
		LoadDataChiTietTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
	}

	protected void gvChiTietTracking_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int chiTietTrackingID = Convert.ToInt32(gvChiTietTracking.DataKeys[e.RowIndex]["ChiTietTrackingID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaChiTietTracking(chiTietTrackingID))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_ThemSua:XoaChiTietTracking", StringEnum.GetStringValue(HanhDong.Xoa), chiTietTrackingID.ToString(), "ChiTietTrackingID: " + chiTietTrackingID);
				LoadDataChiTietTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
			}
		}
		catch
		{
		}
	}

	private void LoadDataTinhTrangTracking(int TrackingID)
	{
		DBConnect dBConnect = new DBConnect();
		gvTinhTrang.DataSource = dBConnect.LayDanhSachTinhTrangTrackingByID(TrackingID);
		gvTinhTrang.DataBind();
	}

	protected void gvTinhTrang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvTinhTrang.EditIndex = e.NewEditIndex;
			LoadDataTinhTrangTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
		}
		catch (Exception)
		{
		}
	}

	protected void gvTinhTrang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int tinhTrangTrackingID = Convert.ToInt32(gvTinhTrang.DataKeys[e.RowIndex]["TinhTrangTrackingID"]);
			TextBox textBox = gvTinhTrang.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			DBConnect dBConnect = new DBConnect();
			int trackingID = Convert.ToInt32(Page.Request.QueryString["id"]);
			dBConnect.CapNhatTinhTrangTracking(tinhTrangTrackingID, textBox.Text.Trim());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_ThemSua:CapNhatTinhTrangTracking", StringEnum.GetStringValue(HanhDong.ChinhSua), tinhTrangTrackingID.ToString(), "TinhTrangTrackingID: " + tinhTrangTrackingID + "; GhiChu: " + textBox.Text.ToString());
			gvTinhTrang.EditIndex = -1;
			LoadDataTinhTrangTracking(trackingID);
		}
		catch (Exception)
		{
		}
	}

	protected void gvTinhTrang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvTinhTrang.EditIndex = -1;
		LoadDataTinhTrangTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
	}

	protected void gvTinhTrang_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int tinhTrangTrackingID = Convert.ToInt32(gvTinhTrang.DataKeys[e.RowIndex]["TinhTrangTrackingID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaTinhTrangTracking(tinhTrangTrackingID))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_ThemSua:XoaTinhTrangTracking", StringEnum.GetStringValue(HanhDong.Xoa), tinhTrangTrackingID.ToString(), "TinhTrangTrackingID: " + tinhTrangTrackingID);
				LoadDataTinhTrangTracking(Convert.ToInt32(Page.Request.QueryString["id"]));
			}
		}
		catch
		{
		}
	}
}
