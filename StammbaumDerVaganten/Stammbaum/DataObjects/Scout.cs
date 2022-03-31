using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{

    [DataContract]
    public class Scout : Referenceable<Scout>
    {
        [DataMember(Name = "_FN")]
        public VersionedData<string> Forename { get; set; } = new VersionedData<string>();
        [DataMember(Name = "_LN")]
        public VersionedData<string> Lastname { get; set; } = new VersionedData<string>();
        [DataMember(Name = "_SN")]
        public VersionedData<string> Scoutname { get; set; } = new VersionedData<string>();
        [DataMember(Name = "_BD")]
        public VersionedData<Date> Birthdate { get; set; } = new VersionedData<Date>();
        [DataMember(Name = "_CI")]
        public VersionedData<string> ContactInfo { get; set; } = new VersionedData<string>();
        [DataMember(Name = "_C")]
        public VersionedData<string> Comment { get; set; } = new VersionedData<string>();
        
        [DataMember(Name = "_M")]
        public List<Membership> Memberships { get; set; } = new List<Membership>();
        [DataMember(Name = "_A")]
        public List<Activity> Activities { get; set; } = new List<Activity>();

        public Scout()
        { }

        public Scout(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Scout(Database context, bool claimID, string forename, string lastname, string scoutname, Date birthdate, string contactInfo, string comment, List<Membership> memberships, List<Activity> activities)
            : this(context, claimID)
        {
            Forename.OverwriteLatestValue(forename);
            Lastname.OverwriteLatestValue(lastname);
            Scoutname.OverwriteLatestValue(scoutname);
            Birthdate.OverwriteLatestValue(birthdate);
            ContactInfo.OverwriteLatestValue(contactInfo);
            Comment.OverwriteLatestValue(comment);
            Memberships = memberships;
            Activities = activities;
        }

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            foreach (Membership ms in Memberships)
            {
                if (ms.GroupRef.Latest == group.Reference)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in Activities)
            {
                if (a.GroupRef.Latest == group.Reference)
                {
                    return a;
                }
            }
            return null;
        }

        public List<Membership> GetMembershipsInGroup(Group group)
        {
            List<Membership> result = new List<Membership>();
            foreach (Membership ms in Memberships)
            {
                if (ms.GroupRef.Latest == group.Reference)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public List<Activity> GetActivitiesInGroup(Group group)
        {
            List<Activity> result = new List<Activity>();
            foreach (Activity a in Activities)
            {
                if (a.GroupRef.Latest == group.Reference)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

        public override string ToString()
        {
            string nameString = Forename + (Scoutname != "" ? ("\"" + Scoutname + "\"") : "") + Lastname;
            return nameString + " [" + reference.Latest.ToString() + "]";
        }
    }
}
