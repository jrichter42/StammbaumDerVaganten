using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace StammbaumDerVaganten
{
    public class MainViewModel
    {
        public static MainViewModel ActiveVM = null;

        public static Data ActiveData
        {
            get
            {
                if (ActiveVM == null || ActiveVM.Database == null)
                {
                    return null;
                }

                return ActiveVM.Database.Data;
            }
        }

        public Database Database;

        protected ObservableCollection<ScoutVm> scouts;
        protected ObservableCollection<GroupVm> groups;
        protected ObservableCollection<RoleVm> roles;
        protected ObservableCollection<TimepointVm> timepoints;
        /*protected ObservableCollection<MembershipVm> selectedMemberships;
        protected ObservableCollection<ActivityVm> selectedActivities;
        protected ObservableCollection<GroupPhaseVm> selectedGroupPhases;*/

        public ObservableCollection<ScoutVm> Scouts
        {
            get { return scouts; }
            set { scouts = value; }
        }

        public ScoutVm CreateScout()
        {
            return ScoutVm.Create(Database.Data.Scouts, scouts) as ScoutVm;
        }

        public ObservableCollection<GroupVm> Groups
        {
            get { return groups; }
            set { groups = value; }
        }

        public GroupVm CreateGroup()
        {
            return GroupVm.Create(Database.Data.Groups, groups) as GroupVm;
        }

        public ObservableCollection<RoleVm> Roles
        {
            get { return roles; }
            set { roles = value; }
        }

        public RoleVm CreateRole()
        {
            return RoleVm.Create(Database.Data.Roles, roles) as RoleVm;
        }

        public ObservableCollection<TimepointVm> Timepoints
        {
            get { return timepoints; }
            set { timepoints = value; }
        }

        public TimepointVm CreateTimepoint()
        {
            return TimepointVm.Create(Database.Data.Timepoints, timepoints) as TimepointVm;
        }

        /*public ObservableCollection<MembershipVm> Memberships
        {
            get { return selectedMemberships; }
            set { selectedMemberships = value; }
        }

        public MembershipVm CreateMembership(ScoutVm selectedScout)
        {
            if (selectedScout == null)
            {
                return null;
            }
            List<Membership> dataList = selectedScout.Model.Memberships;
            return MembershipVm.Create(dataList, selectedMemberships) as MembershipVm;
        }

        public ObservableCollection<ActivityVm> Activities
        {
            get { return selectedActivities; }
            set { selectedActivities = value; }
        }

        public ActivityVm CreateActivity(ScoutVm selectedScout)
        {
            if (selectedScout == null)
            {
                return null;
            }
            List<Activity> dataList = selectedScout.Model.Activities;
            return ActivityVm.Create(dataList, selectedActivities) as ActivityVm;
        }

        public ObservableCollection<GroupPhaseVm> GroupPhases
        {
            get { return selectedGroupPhases; }
            set { selectedGroupPhases = value; }
        }

        public GroupPhaseVm CreateGroupPhase(GroupVm selectedGroup)
        {
            if (selectedGroup == null)
            {
                return null;
            }
            return GroupPhaseVm.Create(selectedGroup.Model.AdditionalPhases, selectedGroup.AdditionalPhases) as GroupPhaseVm;
        }*/

        public MainViewModel()
        {
            Database = new Database();
            RebuildViewmodels();
        }

        public void Load()
        {
            Log.Write(Log_Level.Message, "Load triggert");
            if (!Database.Load())
            {
                Log.Write(Log_Level.Error, "Failed to load Database");
            }
            else
            {
                Log.Write(Log_Level.Message, "Loaded Data");
            }
        }

        public void Save()
        {
            Log.Write(Log_Level.Message, "Save triggert");
            if (!Database.Save())
            {
                Log.Write(Log_Level.Error, "Failed to save Database");
            }
            else
            {
                Log.Write(Log_Level.Message, "Saved Data");
            }
        }

        private void RebuildViewmodelCollection<T, VmT>(List<T> models, ObservableCollection<VmT> viewmodelCollection) where T : new() where VmT : Viewmodel<T>, new()
        {
            if (viewmodelCollection == null)
            {
                viewmodelCollection = new ObservableCollection<VmT>();
            }
            else
            {
                viewmodelCollection.Clear();
            }

            for (int i = 0; i < models.Count; i++)
            {
                T model = models[i]; //Why the fuck can't I properly declare something to be reference vs copied in C#. Yes I know these will be classes due to the type constraint but fuck this shit thats ugly to read.
                VmT viewmodel = new VmT();
                viewmodel.SetModel(model);
                viewmodelCollection.Add(viewmodel);
            }
        }

        public void RebuildViewmodels()
        {
            RebuildViewmodelCollection(Database.Data.Scouts, scouts);
            RebuildViewmodelCollection(Database.Data.Groups, groups);
            RebuildViewmodelCollection(Database.Data.Roles, roles);
            RebuildViewmodelCollection(Database.Data.Timepoints, timepoints);
        }

        /*public void RebuildSelectedScoutViewmodels(ScoutVm scout)
        {
            Memberships = null;
            Activities = null;
            if (scout != null)
            {
                Memberships = scout.Memberships;
                Activities = scout.Activities;
            }
        }*/
    }
}
