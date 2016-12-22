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
    /// Interaction logic for Scoutlist.xaml
    /// </summary>
    public partial class Scoutlist : UserControl
    {
        public Scoutlist()
        {
            InitializeComponent();
        }

        private ScoutVm GetSelectedScout()
        {
            ScoutVm scout = null;

            MainViewModel vm = MainViewModel.ActiveVM;

            int idx = pfadi_scoutlist.SelectedIndex;
            if (vm != null && vm.Scouts != null && idx != -1 && vm.Scouts != null && idx < vm.Scouts.Count)
            {
                scout = vm.Scouts[idx];
            }

            return scout;
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {

        }

        private void pfadi_scoutlist_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {

        }

        private void pfadi_scoutlist_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

        }

        private void pfadi_list_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

        }
    }
}
