using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class HangKhoan_Them : Page
{
	private DataTable DonHangDT = new DataTable();

	protected GridView gvThemMoiDonHang;

	private void initBanHangDT()
	{
		DonHangDT.Columns.Add(new DataColumn("WebsiteName", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("username", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("loaitien", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("linkweb", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("linkhinh", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("corlor", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("size", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("soluong", Type.GetType("System.Int32")));
		DonHangDT.Columns.Add(new DataColumn("dongiaweb", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("ghichu", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("MaSoHang", Type.GetType("System.String")));
	}

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			gvThemMoiDonHang.DataSource = new object[1];
			gvThemMoiDonHang.DataBind();
		}
	}

	private void SetInitialRow()
	{
		ViewState["DonHangDT"] = DonHangDT;
		gvThemMoiDonHang.DataSource = DonHangDT;
		gvThemMoiDonHang.DataBind();
	}

	protected void gvThemMoiDonHang_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.DataItem == null)
		{
			e.Row.Visible = false;
		}
	}

	protected void gvThemMoiDonHang_DataBound(object sender, EventArgs e)
	{
		try
		{
			DropDownList dropDownList = gvThemMoiDonHang.FooterRow.FindControl("ddUsername") as DropDownList;
			UserManager userManager = new UserManager();
			List<ApplicationUser> list = new List<ApplicationUser>(userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList());
			list.Insert(0, new ApplicationUser
			{
				UserName = "--Temporary user--"
			});
			dropDownList.DataSource = list;
			dropDownList.DataBind();
			BLL bLL = new BLL();
			DropDownList dropDownList2 = gvThemMoiDonHang.FooterRow.FindControl("ddWebsite") as DropDownList;
			List<Website> dataSource = bLL.LayDanhSachWebsite();
			dropDownList2.DataSource = dataSource;
			dropDownList2.DataBind();
			dropDownList2.Items.Insert(0, new ListItem("--Web khac--", "--Web khac--"));
		}
		catch
		{
		}
	}

	protected void gvThemMoiDonHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DropDownList dropDownList = gvThemMoiDonHang.FooterRow.FindControl("ddWebsite") as DropDownList;
		DropDownList dropDownList2 = gvThemMoiDonHang.FooterRow.FindControl("ddUsername") as DropDownList;
		TextBox textBox = gvThemMoiDonHang.FooterRow.FindControl("tbLinkWeb") as TextBox;
		TextBox textBox2 = gvThemMoiDonHang.FooterRow.FindControl("tbLinkHinh") as TextBox;
		TextBox textBox3 = gvThemMoiDonHang.FooterRow.FindControl("tbCorlor") as TextBox;
		TextBox textBox4 = gvThemMoiDonHang.FooterRow.FindControl("tbSize") as TextBox;
		TextBox textBox5 = gvThemMoiDonHang.FooterRow.FindControl("tbSoluong") as TextBox;
		TextBox textBox6 = gvThemMoiDonHang.FooterRow.FindControl("tbGiaWeb") as TextBox;
		TextBox textBox7 = gvThemMoiDonHang.FooterRow.FindControl("tbGhichu") as TextBox;
		FileUpload fileUpload = gvThemMoiDonHang.FooterRow.FindControl("fuHinhAnh") as FileUpload;
		string text = textBox2.Text;
		if (e.CommandName == "Insert")
		{
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
			if (dBConnect.ThemDatHangSimple(dropDownList.SelectedValue, dropDownList2.SelectedValue, base.User.Identity.GetUserName(), textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), "VND", textBox7.Text.Trim(), 1.0, 0.0, HangKhoan: true, null, "", null))
			{
				if (ViewState["DonHangDT"] != null)
				{
					DonHangDT = (DataTable)ViewState["DonHangDT"];
				}
				else
				{
					initBanHangDT();
				}
				DataRow dataRow = DonHangDT.NewRow();
				dataRow["WebsiteName"] = dropDownList.SelectedValue;
				dataRow["username"] = dropDownList2.SelectedValue;
				dataRow["linkweb"] = textBox.Text.Trim();
				dataRow["linkhinh"] = text.Trim();
				dataRow["corlor"] = textBox3.Text.Trim();
				dataRow["size"] = textBox4.Text.Trim();
				dataRow["soluong"] = Convert.ToInt32(textBox5.Text.Trim());
				dataRow["dongiaweb"] = Convert.ToDouble(textBox6.Text.Trim());
				dataRow["loaitien"] = "VND";
				dataRow["ghichu"] = textBox7.Text.Trim();
				dataRow["MaSoHang"] = "";
				DonHangDT.Rows.Add(dataRow);
				ViewState["DonHangDT"] = DonHangDT;
				gvThemMoiDonHang.DataSource = DonHangDT;
				gvThemMoiDonHang.DataBind();
				BLL bLL = new BLL();
				string noiDung = bLL.NoiDungDonHangSystemLogs(dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), 0.0, 0.0, 0.0, 0.0, 0.0, "VND", textBox7.Text.Trim(), 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", "", "", "");
				dBConnect.ThemSystemLogs(dropDownList2.SelectedValue, "HangKhoan_Them", StringEnum.GetStringValue(HanhDong.ThemMoi), "", noiDung);
			}
		}
		else if (e.CommandName == "Clone" && ViewState["DonHangDT"] != null)
		{
			DonHangDT = (DataTable)ViewState["DonHangDT"];
			DataRow dataRow2 = DonHangDT.Rows[DonHangDT.Rows.Count - 1];
			try
			{
				dropDownList.ClearSelection();
				dropDownList.Items.FindByValue(dataRow2["WebsiteName"].ToString()).Selected = true;
			}
			catch
			{
			}
			try
			{
				dropDownList2.ClearSelection();
				dropDownList2.Items.FindByValue(dataRow2["username"].ToString()).Selected = true;
			}
			catch
			{
			}
			textBox.Text = dataRow2["linkweb"].ToString();
			textBox2.Text = dataRow2["linkhinh"].ToString();
			textBox3.Text = dataRow2["corlor"].ToString();
			textBox4.Text = dataRow2["size"].ToString();
			textBox5.Text = dataRow2["soluong"].ToString();
			textBox6.Text = dataRow2["dongiaweb"].ToString();
			textBox7.Text = dataRow2["ghichu"].ToString();
		}
	}
}
