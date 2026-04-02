using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.ModelBinding;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan.Account;

public class ListUser : Page
{
	protected Literal ErrorMessage;

	protected TextBox tbKeyWord;

	protected Button btSearch;

	protected Button btExportToExcel1Page;

	protected Button btExportToExcelAllWithFilter;

	protected GridView grvUser;

	protected void Page_Load()
	{
	}

	public IQueryable<ApplicationUser> grvUser_GetData([Control("tbKeyWord")] string SearchText)
	{
		SearchText = ((SearchText == null) ? string.Empty : SearchText);
		UserManager userManager = new UserManager();
		return from u in userManager.Users
			where u.UserName.Contains(SearchText)
			orderby u.UserName
			select u;
	}

	public void grvUser_UpdateItem(string Id)
	{
		ApplicationUser applicationUser = null;
		UserManager userManager = new UserManager();
		applicationUser = userManager.FindById(Id);
		if (applicationUser == null)
		{
			base.ModelState.AddModelError("", $"Item with id {Id} was not found");
			return;
		}
		TryUpdateModel(applicationUser);
		if (base.ModelState.IsValid)
		{
			userManager.UpdateAsync(applicationUser);
			DBConnect dBConnect = new DBConnect();
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ListUser:UpdateAsync", StringEnum.GetStringValue(HanhDong.ChinhSua), Id, "ID: " + Id + "; UserName:" + applicationUser.UserName + "; HoTen:" + applicationUser.HoTen + "; DiaChi:" + applicationUser.DiaChi + "; TinhThanh:" + applicationUser.TinhThanh + "; PhoneNumber:" + applicationUser.PhoneNumber + "; Email:" + applicationUser.Email + "; SoTaiKhoan:" + applicationUser.SoTaiKhoan + "; UserName:" + applicationUser.UserName + "; HinhThucNhanHang:" + applicationUser.HinhThucNhanHang + "; KhachBuon:" + applicationUser.KhachBuon + "; LinkTaiKhoanMang:" + applicationUser.LinkTaiKhoanMang);
			grvUser.DataBind();
		}
	}

	public void grvUser_DeleteItem(string Id)
	{
		UserManager manager = new UserManager();
		manager.Delete(manager.FindById(Id));
		DBConnect dBConnect = new DBConnect();
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ListUser:Delete", StringEnum.GetStringValue(HanhDong.Xoa), Id, "ID: " + Id);
	}

	protected void btExportToExcel1Page_Click(object sender, EventArgs e)
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		grvUser.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}

	protected void btExportToExcelAllWithFilter_Click(object sender, EventArgs e)
	{
		string SearchText = tbKeyWord.Text;
		UserManager userManager = new UserManager();
		List<ApplicationUser> items = (from u in userManager.Users
			where u.UserName.Contains(SearchText)
			orderby u.UserName
			select u).ToList();
		ExcelUtils excelUtils = new ExcelUtils();
		DataTable dataTable = new DataTable();
		DataView dataView = new DataView(ToDataTable(items));
		dataTable = dataView.ToTable(false, "ID", "UserName", "HoTen", "DiaChi", "Email", "PhoneNumber", "TinhThanh", "SoTaiKhoan", "HinhThucNhanHang", "KhachBuon", "LinkTaiKhoanMang");
		base.Response.ClearContent();
		base.Response.Clear();
		base.Response.ContentType = "application/vnd.xls";
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.AppendHeader("Content-Disposition", string.Format("attachment; filename=DanhSachDonHang_{0}.xls", DateTime.Now.ToString("yyyyMMdd_HHmm")));
		base.Response.Charset = Encoding.UTF8.WebName;
		base.Response.HeaderEncoding = Encoding.UTF8;
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.BinaryWrite(Encoding.UTF8.GetPreamble());
		StringBuilder stringBuilder = new StringBuilder();
		for (int num = 0; num < dataTable.Columns.Count; num++)
		{
			stringBuilder.Append(dataTable.Columns[num].ColumnName + ",");
		}
		stringBuilder.Append("\r\n");
		for (int num2 = 0; num2 < dataTable.Rows.Count; num2++)
		{
			for (int num3 = 0; num3 < dataTable.Columns.Count; num3++)
			{
				stringBuilder.Append(dataTable.Rows[num2][num3].ToString().Replace(",", ";") + ",");
			}
			stringBuilder.Append("\r\n");
		}
		base.Response.Output.Write(stringBuilder.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	public DataTable ToDataTable<T>(List<T> items)
	{
		DataTable dataTable = new DataTable(typeof(T).Name);
		PropertyInfo[] properties = typeof(T).GetProperties(BindingFlags.Instance | BindingFlags.Public);
		PropertyInfo[] array = properties;
		foreach (PropertyInfo propertyInfo in array)
		{
			dataTable.Columns.Add(propertyInfo.Name);
		}
		foreach (T item in items)
		{
			object[] array2 = new object[properties.Length];
			for (int j = 0; j < properties.Length; j++)
			{
				array2[j] = properties[j].GetValue(item, null);
			}
			dataTable.Rows.Add(array2);
		}
		return dataTable;
	}
}
