using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for Grouplist.xaml
    /// </summary>
    public partial class Grouplist : UserControl
    {
        public Grouplist()
        {
            InitializeComponent();
            pfadi_grouplist.ItemsSource = MainViewmodel.ActiveVm.Groups;
        }

        private GroupVm GetSelectedGroup()
        {
            MainViewmodel vm = MainViewmodel.ActiveVm;

            GroupVm group = null;

            int idx = pfadi_grouplist.SelectedIndex;
            if (vm != null && vm.Groups != null && idx != -1 && vm.Groups != null && idx < vm.Groups.Count)
            {
                group = vm.Groups[idx];
            }

            return group;
        }

        private void pfadi_grouplist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = MainViewmodel.ActiveVm.CreateGroup();
        }

        private void pfadi_list_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);
        }

        private void pfadi_additionalphaseslist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = new GroupPhase();
        }
    }
}
