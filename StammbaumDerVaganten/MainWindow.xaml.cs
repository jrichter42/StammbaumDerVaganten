using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;
using System.Windows.Controls;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        MainViewModel vm;

        public MainWindow()
        {
            InitializeComponent();
            vm = (MainViewModel)DataContext;
            MainViewModel.ActiveVM = vm;
            Load(this, null);
            if (Keyboard.PrimaryDevice.IsKeyDown(Key.Escape))
            {
                Application.Current.Shutdown();
            }
            pfadi_log.ItemsSource = Log.History;

            Log.EntryAdded += HandleLogEntryAdded;
            HandleLogEntryAdded(this.ToString(), Log.HistoryTop);
        }

        private void HandleLogEntryAdded(string author, string entry)
        {
            if (pfadi_logexpander == null)
            {
                return;
            }

            TextBlock text = (TextBlock)pfadi_logexpander.Header;
            if (text == null)
            {
                return;
            }

            if (pfadi_logexpander.IsExpanded)
            {
                text.Text = "Log";
            }
            text.Text = entry;
        }

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Load();
            pfadi_rolelist.ItemsSource = vm.Roles;
            pfadi_timepointlist.ItemsSource = vm.Timepoints;
            pfadi_grouplist.ItemsSource = vm.Groups;
            pfadi_scoutlist.ItemsSource = vm.Scouts;
            OnScoutSelectionChanged();
        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Save();
        }

        private void OnScoutSelectionChanged()
        {
            int idx = pfadi_scoutlist.SelectedIndex;
            if (idx == -1 || vm.Scouts == null || idx >= vm.Scouts.Count)
            {
                pfadi_membershiplist.ItemsSource = null;
                pfadi_activitylist.ItemsSource = null;
                vm.FlushMemberActivityLists();
                return;
            }
            Scout scout = vm.Scouts[idx];
            if (scout != null)
            {
                vm.Memberships = scout.Memberships;
                vm.Activities = scout.Activities;
            }
            pfadi_membershiplist.ItemsSource = vm.Memberships;
            pfadi_activitylist.ItemsSource = vm.Activities;
        }

        private void pfadi_rolelist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Role(true);
        }

        private void pfadi_timepointlist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Timepoint(true);
        }

        private void pfadi_grouplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Group(true);
        }

        private void pfadi_additionalphaseslist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new GroupPhase();
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Scout();
        }

        private void pfadi_membershiplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Membership();
        }

        private void pfadi_activitylist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Activity();
        }

        private void pfadi_scoutlist_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }

        private void pfadi_scoutlist_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }

        bool manualCommit = false;
        private void pfadi_list_CellEditEnding(object sender, System.Windows.Controls.DataGridCellEditEndingEventArgs e)
        {
            if (!manualCommit)
            {
                manualCommit = true;
                DataGrid grid = (DataGrid)sender;
                grid.CommitEdit(DataGridEditingUnit.Row, true);
                manualCommit = false;
            }
        }

        private void pfadi_timepointlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            pfadi_list_CellEditEnding(sender, e);

            //Hack to make different levels of PropertyChanged update each other without resolving the acutal issue
            if ((string)e.Column.Header == "Datum")
            {
                pfadi_grouplist.ItemsSource = vm.Groups;
                OnScoutSelectionChanged();
            }
        }
    }
}
