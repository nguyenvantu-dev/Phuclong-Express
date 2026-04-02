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

public class QLDatHang_Them : Page
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
		DonHangDT.Columns.Add(new DataColumn("cong", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("phuthu", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("saleoff", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("shipUSA", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("tax", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("tiencongVND", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("tongtienVND", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("QuocGiaID", Type.GetType("System.Int32")));
		DonHangDT.Columns.Add(new DataColumn("TenQuocGia", Type.GetType("System.String")));
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
			DropDownList dropDownList3 = gvThemMoiDonHang.FooterRow.FindControl("ddLoaiTien") as DropDownList;
			List<TyGia> dataSource2 = bLL.LayDanhSachTyGia();
			dropDownList3.DataSource = dataSource2;
			dropDownList3.DataBind();
			ListItem listItem = dropDownList3.Items.FindByText("GBP");
			if (listItem != null)
			{
				dropDownList3.ClearSelection();
				listItem.Selected = true;
			}
			DBConnect dBConnect = new DBConnect();
			DropDownList dropDownList4 = gvThemMoiDonHang.FooterRow.FindControl("ddQuocGia") as DropDownList;
			dropDownList4.DataSource = dBConnect.LayDanhSachQuocGia();
			dropDownList4.DataBind();
		}
		catch
		{
		}
	}

	protected void gvThemMoiDonHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DropDownList dropDownList = gvThemMoiDonHang.FooterRow.FindControl("ddWebsite") as DropDownList;
		DropDownList dropDownList2 = gvThemMoiDonHang.FooterRow.FindControl("ddUsername") as DropDownList;
		DropDownList dropDownList3 = gvThemMoiDonHang.FooterRow.FindControl("ddLoaiTien") as DropDownList;
		TextBox textBox = gvThemMoiDonHang.FooterRow.FindControl("tbLinkWeb") as TextBox;
		TextBox textBox2 = gvThemMoiDonHang.FooterRow.FindControl("tbLinkHinh") as TextBox;
		TextBox textBox3 = gvThemMoiDonHang.FooterRow.FindControl("tbCorlor") as TextBox;
		TextBox textBox4 = gvThemMoiDonHang.FooterRow.FindControl("tbSize") as TextBox;
		TextBox textBox5 = gvThemMoiDonHang.FooterRow.FindControl("tbSoluong") as TextBox;
		TextBox textBox6 = gvThemMoiDonHang.FooterRow.FindControl("tbGiaWeb") as TextBox;
		TextBox textBox7 = gvThemMoiDonHang.FooterRow.FindControl("tbGhichu") as TextBox;
		FileUpload fileUpload = gvThemMoiDonHang.FooterRow.FindControl("fuHinhAnh") as FileUpload;
		string text = textBox2.Text;
		TextBox textBox8 = gvThemMoiDonHang.FooterRow.FindControl("tbgvCong") as TextBox;
		TextBox textBox9 = gvThemMoiDonHang.FooterRow.FindControl("tbPhuThu") as TextBox;
		TextBox textBox10 = gvThemMoiDonHang.FooterRow.FindControl("tbSaleOff") as TextBox;
		TextBox textBox11 = gvThemMoiDonHang.FooterRow.FindControl("tbShipUS") as TextBox;
		TextBox textBox12 = gvThemMoiDonHang.FooterRow.FindControl("tbgvTax") as TextBox;
		DropDownList dropDownList4 = gvThemMoiDonHang.FooterRow.FindControl("ddQuocGia") as DropDownList;
		double result = 0.0;
		DBConnect dBConnect = new DBConnect();
		if (e.CommandName == "Insert")
		{
			int num = Convert.ToInt32(textBox5.Text.Trim());
			double num2 = Convert.ToDouble(textBox6.Text.Trim());
			double result2;
			if (string.IsNullOrEmpty(textBox12.Text.Trim()))
			{
				result2 = 0.0;
			}
			else if (!double.TryParse(textBox12.Text.Trim(), out result2))
			{
				return;
			}
			if (string.IsNullOrEmpty(textBox8.Text.Trim()))
			{
				result = 0.0;
			}
			else if (!double.TryParse(textBox8.Text.Trim(), out result))
			{
				return;
			}
			double result3;
			if (string.IsNullOrEmpty(textBox9.Text.Trim()))
			{
				result3 = 0.0;
			}
			else if (!double.TryParse(textBox9.Text.Trim(), out result3))
			{
				return;
			}
			double result4;
			if (string.IsNullOrEmpty(textBox10.Text.Trim()))
			{
				result4 = 0.0;
			}
			else if (!double.TryParse(textBox10.Text.Trim(), out result4))
			{
				return;
			}
			double result5;
			if (string.IsNullOrEmpty(textBox11.Text.Trim()))
			{
				result5 = 0.0;
			}
			else if (!double.TryParse(textBox11.Text.Trim(), out result5))
			{
				return;
			}
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
			if (dBConnect.ThemDatHangSimpleCoTamTinh(dropDownList.SelectedValue, dropDownList2.SelectedValue, base.User.Identity.GetUserName(), textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), num, num2, dropDownList3.SelectedItem.Text, textBox7.Text.Trim(), Convert.ToDouble(dropDownList3.SelectedValue), result4, HangKhoan: false, result, result5, result2, result3, Convert.ToInt32(dropDownList4.SelectedValue)))
			{
				BLL bLL = new BLL();
				string noiDung = bLL.NoiDungDonHangSystemLogs(dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), num, num2, result4, result3, result5, result2, 0.0, dropDownList3.SelectedItem.Text, textBox7.Text.Trim(), Convert.ToDouble(dropDownList3.SelectedValue), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", "");
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "QLDatHang_Them:ThemDatHangSimpleCoTamTinh", StringEnum.GetStringValue(HanhDong.ThemMoi), "", noiDung);
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
				dataRow["loaitien"] = dropDownList3.SelectedItem.Text.Trim();
				dataRow["ghichu"] = textBox7.Text.Trim();
				dataRow["cong"] = result;
				dataRow["phuthu"] = result3;
				dataRow["saleoff"] = result4;
				dataRow["shipUSA"] = result5;
				dataRow["tax"] = result2;
				double num3 = 0.0;
				double num4 = 0.0;
				num3 = (100.0 - result4) / 100.0 * num2 * (double)num;
				UserManager manager = new UserManager();
				ApplicationUser applicationUser = manager.FindByName(dropDownList2.SelectedValue);
				GiaTienCong giaTienCong = bLL.LayGiaTienCong(dropDownList3.SelectedItem.Text.Trim(), num2, applicationUser.KhachBuon);
				if (giaTienCong.TinhTheoPhanTram)
				{
					double num5 = num3 * result / 100.0;
					num4 = num5 * Convert.ToDouble(dropDownList3.SelectedValue);
				}
				else
				{
					double num5 = 0.0;
					num4 = giaTienCong.TienCong1Mon * (double)num;
				}
				num3 += num3 * 0.01 * result2;
				num3 += result5 * (double)num;
				num3 += result3 * (double)num;
				dataRow["tongtienVND"] = EnhancedMath.RoundUp(num3 * Convert.ToDouble(dropDownList3.SelectedValue) + num4, 0);
				dataRow["tiencongVND"] = num4;
				dataRow["QuocGiaID"] = Convert.ToInt32(dropDownList4.SelectedValue);
				dataRow["TenQuocGia"] = dropDownList4.SelectedItem.Text;
				DonHangDT.Rows.Add(dataRow);
				ViewState["DonHangDT"] = DonHangDT;
				gvThemMoiDonHang.DataSource = DonHangDT;
				gvThemMoiDonHang.DataBind();
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
			try
			{
				dropDownList3.ClearSelection();
				dropDownList3.Items.FindByText(dataRow2["loaitien"].ToString()).Selected = true;
			}
			catch
			{
			}
			try
			{
				dropDownList4.ClearSelection();
				dropDownList4.Items.FindByValue(dataRow2["QuocGiaID"].ToString()).Selected = true;
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
			textBox8.Text = dataRow2["cong"].ToString();
			textBox9.Text = dataRow2["phuthu"].ToString();
			textBox10.Text = dataRow2["saleoff"].ToString();
			textBox11.Text = dataRow2["shipUSA"].ToString();
			textBox12.Text = dataRow2["tax"].ToString();
		}
	}
}
