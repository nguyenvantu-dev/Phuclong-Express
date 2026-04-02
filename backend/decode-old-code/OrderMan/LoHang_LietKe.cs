using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using OrderMan.Models;

namespace OrderMan;

public class LoHang_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected GridView gvLoHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			KhoiTaoNgay();
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
		}
	}

	private void KhoiTaoNgay()
	{
		try
		{
			DateTime dateTime = DateTime.Now.AddMonths(-1);
			DateTime now = DateTime.Now;
			tbTuNgay.Text = dateTime.ToString("dd/MM/yyyy");
			tbDenNgay.Text = now.ToString("dd/MM/yyyy");
		}
		catch
		{
		}
	}

	private void LoadDanhSachLoHang()
	{
		try
		{
			string[] array = tbTuNgay.Text.Trim().Split('/');
			if (array.Length == 3)
			{
				DateTime value = new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]), 0, 0, 0);
				string[] array2 = tbDenNgay.Text.Trim().Split('/');
				if (array2.Length == 3)
				{
					DateTime value2 = new DateTime(Convert.ToInt32(array2[2]), Convert.ToInt32(array2[1]), Convert.ToInt32(array2[0]), 23, 59, 59);
					BLL bLL = new BLL();
					LoHangPhanTrang loHangPhanTrang = bLL.LayDanhSachLoHang(ddUserName.SelectedValue, value, value2, pageSize, pageNum);
					gvLoHang.DataSource = loHangPhanTrang.DanhSachLoHang;
					gvLoHang.DataBind();
					myPager.BuildPaging(pageNum, loHangPhanTrang.TotalItem, pageSize);
				}
			}
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
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachLoHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachLoHang();
	}
}
